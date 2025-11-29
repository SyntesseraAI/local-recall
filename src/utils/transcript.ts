import type {
  TranscriptMessage,
  TranscriptInput,
  RawTranscriptMessage,
  ContentBlock,
} from '../core/types.js';
import { extractKeywordsFromText } from './markdown.js';

/**
 * Extract text content from content blocks array
 */
function extractTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

/**
 * Extract thinking content from content blocks array
 */
function extractThinkingFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is { type: 'thinking'; thinking: string } => block.type === 'thinking')
    .map((block) => block.thinking)
    .join('\n');
}

/**
 * Parse a raw transcript message into our normalized format
 */
function parseRawMessage(raw: RawTranscriptMessage): TranscriptMessage | null {
  const role = raw.type;
  if (role !== 'user' && role !== 'assistant') {
    return null;
  }

  const timestamp = raw.timestamp;
  if (typeof timestamp !== 'string') {
    return null;
  }

  // Validate timestamp
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return null;
  }

  // Get content blocks - could be in message.content or directly in content
  const rawContent = raw.message?.content ?? raw.content;

  let content = '';
  let thinking: string | undefined;

  if (typeof rawContent === 'string') {
    content = rawContent;
  } else if (Array.isArray(rawContent)) {
    content = extractTextFromBlocks(rawContent as ContentBlock[]);
    thinking = extractThinkingFromBlocks(rawContent as ContentBlock[]) || undefined;
  }

  return {
    role,
    content,
    thinking,
    timestamp,
  };
}

/**
 * Validate that an object is a valid raw transcript message (new format with content blocks)
 */
function isValidRawTranscriptMessage(obj: unknown): obj is RawTranscriptMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const message = obj as Record<string, unknown>;

  // Check type field (raw format uses 'type' not 'role')
  if (typeof message['type'] !== 'string') {
    return false;
  }
  if (message['type'] !== 'user' && message['type'] !== 'assistant') {
    return false;
  }

  // Check timestamp
  if (typeof message['timestamp'] !== 'string') {
    return false;
  }

  // Validate timestamp is a valid ISO date string
  const date = new Date(message['timestamp']);
  if (isNaN(date.getTime())) {
    return false;
  }

  return true;
}

/**
 * Legacy transcript message structure (old format for backward compatibility)
 */
interface LegacyTranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  timestamp: string;
}

/**
 * Validate that an object is a valid legacy transcript message (old format with flat content)
 */
function isValidLegacyTranscriptMessage(obj: unknown): obj is LegacyTranscriptMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const message = obj as Record<string, unknown>;

  // Check role field (legacy format uses 'role')
  if (typeof message['role'] !== 'string') {
    return false;
  }
  if (message['role'] !== 'user' && message['role'] !== 'assistant') {
    return false;
  }

  // Check content is a string
  if (typeof message['content'] !== 'string') {
    return false;
  }

  // Check timestamp
  if (typeof message['timestamp'] !== 'string') {
    return false;
  }

  // Check optional thinking field
  if (message['thinking'] !== undefined && typeof message['thinking'] !== 'string') {
    return false;
  }

  // Validate timestamp is a valid ISO date string
  const date = new Date(message['timestamp']);
  if (isNaN(date.getTime())) {
    return false;
  }

  return true;
}

/**
 * Parse transcript input from JSON string
 * Handles both raw transcript format (with content blocks) and legacy format (flat content)
 */
export function parseTranscript(input: string): TranscriptInput {
  let data: unknown;

  try {
    data = JSON.parse(input);
  } catch {
    throw new Error('Invalid transcript input: malformed JSON');
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid transcript input: expected object');
  }

  const obj = data as Record<string, unknown>;

  if (!obj['transcript'] || !Array.isArray(obj['transcript'])) {
    throw new Error('Invalid transcript input: missing transcript array');
  }

  // Parse each message in the transcript
  const validatedMessages: TranscriptMessage[] = [];
  for (let i = 0; i < obj['transcript'].length; i++) {
    const rawMessage = obj['transcript'][i];

    // Try parsing as raw format first (with content blocks, uses 'type' field)
    if (isValidRawTranscriptMessage(rawMessage)) {
      const parsed = parseRawMessage(rawMessage);
      if (parsed) {
        validatedMessages.push(parsed);
      }
      continue;
    }

    // Try legacy format (flat content string, uses 'role' field)
    if (isValidLegacyTranscriptMessage(rawMessage)) {
      validatedMessages.push({
        role: rawMessage.role,
        content: rawMessage.content,
        thinking: rawMessage.thinking,
        timestamp: rawMessage.timestamp,
      });
      continue;
    }

    // Skip invalid messages silently (they might be system messages, etc.)
  }

  return {
    transcript: validatedMessages,
    session_id: typeof obj['session_id'] === 'string' ? obj['session_id'] : 'unknown',
    working_directory: typeof obj['working_directory'] === 'string' ? obj['working_directory'] : process.cwd(),
  };
}

/**
 * Extract messages from the last N seconds
 */
export function extractNewMessages(
  transcript: TranscriptMessage[],
  timeWindowSeconds: number
): TranscriptMessage[] {
  const now = Date.now();
  const cutoff = now - timeWindowSeconds * 1000;

  return transcript.filter((message) => {
    const messageTime = new Date(message.timestamp).getTime();
    return messageTime >= cutoff;
  });
}

/**
 * Generate a subject line from message content
 *
 * - Multi-line text: takes the first line
 * - Single-line text: takes up to the first period, or all text if no period
 */
function generateSubject(content: string, maxLength: number = 200): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  // Check if multi-line
  const newlineIndex = trimmed.indexOf('\n');
  let subject: string;

  if (newlineIndex !== -1) {
    // Multi-line: take first line
    subject = trimmed.substring(0, newlineIndex).trim();
  } else {
    // Single line: take up to first period, or all text
    const periodIndex = trimmed.indexOf('.');
    subject = periodIndex !== -1 ? trimmed.substring(0, periodIndex) : trimmed;
  }

  // Truncate if needed
  if (subject.length <= maxLength) {
    return subject;
  }

  return subject.substring(0, maxLength - 3) + '...';
}

/**
 * Detect scope from content (global, file, or area)
 */
function detectScope(content: string): string {
  // Check for specific file mentions
  const fileMatch = content.match(/(?:in|file|at)\s+[`"']?([^`"'\s]+\.[a-z]{1,4})[`"']?/i);
  if (fileMatch?.[1] && !fileMatch[1].includes('*')) {
    return `file:${fileMatch[1]}`;
  }

  // Check for area/component mentions
  const areaPatterns = [
    /(?:in|for)\s+the\s+(\w+)\s+(?:component|module|service|area|section)/i,
    /(?:the\s+)?(\w+)\s+(?:system|subsystem|layer)/i,
  ];

  for (const pattern of areaPatterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return `area:${match[1].toLowerCase()}`;
    }
  }

  return 'global';
}

/**
 * Analyze messages and convert assistant messages to memories
 *
 * Saves:
 * - All thinking (even single-line) - prefixed with "[Thinking]"
 * - Only multiline answers/content
 *
 * User messages are not saved.
 */
export function analyzeForMemories(
  messages: TranscriptMessage[]
): Array<{
  subject: string;
  keywords: string[];
  applies_to: string;
  content: string;
  occurred_at: string;
}> {
  const memories: Array<{
    subject: string;
    keywords: string[];
    applies_to: string;
    content: string;
    occurred_at: string;
  }> = [];

  for (const message of messages) {
    // Skip user messages - only save assistant messages
    if (message.role !== 'assistant') continue;

    // Save all thinking (even single-line)
    if (message.thinking?.trim()) {
      memories.push({
        subject: generateSubject(message.thinking),
        keywords: extractKeywordsFromText(message.thinking, { maxKeywords: 5, minLength: 3 }),
        applies_to: detectScope(message.thinking),
        content: message.thinking,
        occurred_at: message.timestamp,
      });
    }

    // Only save multiline content/answers
    if (message.content.trim()) {
      const lines = message.content.trim().split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        memories.push({
          subject: generateSubject(message.content),
          keywords: extractKeywordsFromText(message.content, { maxKeywords: 5, minLength: 3 }),
          applies_to: detectScope(message.content),
          content: message.content,
          occurred_at: message.timestamp,
        });
      }
    }
  }

  return memories;
}

/**
 * Memory suggestion returned from transcript analysis
 */
export interface MemorySuggestion {
  subject: string;
  keywords: string[];
  applies_to: string;
  content: string;
  occurred_at: string;
}

/**
 * Raw transcript entry structure (JSONL line format from Claude Code)
 */
interface RawTranscriptEntry {
  type: string;
  timestamp?: string;
  message?: {
    role?: string;
    content?: string | ContentBlock[];
  };
}

/**
 * Parse raw JSONL transcript content and extract memory-worthy content
 *
 * This is the main entry point for processing transcripts.
 * Takes raw JSONL content (as read from the transcript file) and returns
 * an array of memory suggestions ready to be saved.
 *
 * @param rawContent - Raw JSONL string from transcript file
 * @returns Array of memory suggestions
 */
export function parseTranscriptForMemories(rawContent: string): MemorySuggestion[] {
  const lines = rawContent.split('\n').filter((line) => line.trim());
  const messages: TranscriptMessage[] = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as RawTranscriptEntry;

      // Only process user/assistant message entries
      if (entry.type !== 'user' && entry.type !== 'assistant') {
        continue;
      }

      const role = entry.type as 'user' | 'assistant';
      const timestamp = entry.timestamp ?? new Date().toISOString();
      const rawContent = entry.message?.content;

      let content = '';
      let thinking: string | undefined;

      if (typeof rawContent === 'string') {
        content = rawContent;
      } else if (Array.isArray(rawContent)) {
        content = extractTextFromBlocks(rawContent);
        thinking = extractThinkingFromBlocks(rawContent) || undefined;
      } else {
        continue;
      }

      messages.push({ role, content, thinking, timestamp });
    } catch {
      // Skip malformed lines
    }
  }

  return analyzeForMemories(messages);
}

/**
 * Default timeout for reading stdin (10 seconds)
 */
const STDIN_TIMEOUT_MS = 10000;

/**
 * Read from stdin (for hook scripts)
 * Handles cases where stdin may have already ended or is in flowing mode.
 * Includes a timeout to avoid hanging forever.
 */
export async function readStdin(timeoutMs: number = STDIN_TIMEOUT_MS): Promise<string> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    // If stdin has already ended, resolve immediately
    if (process.stdin.readableEnded) {
      resolve('');
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for stdin'));
    }, timeoutMs);

    function cleanup() {
      process.stdin.off('data', onData);
      process.stdin.off('end', onEnd);
      process.stdin.off('error', onError);
      clearTimeout(timeout);
    }

    function onData(chunk: Buffer) {
      chunks.push(chunk);
    }

    function onEnd() {
      cleanup();
      resolve(Buffer.concat(chunks).toString('utf-8'));
    }

    function onError(err: Error) {
      cleanup();
      reject(err);
    }

    process.stdin.on('data', onData);
    process.stdin.on('end', onEnd);
    process.stdin.on('error', onError);
  });
}
