import type { TranscriptMessage, TranscriptInput } from '../core/types.js';
import { extractKeywordsFromText } from './markdown.js';

/**
 * Maximum distance from start/end of extracted text to look for sentence boundaries.
 * Used in extractContextAroundMatch to find clean sentence breaks.
 */
const SENTENCE_BOUNDARY_SEARCH_LIMIT = 50;

/**
 * Validate that an object is a valid TranscriptMessage
 */
function isValidTranscriptMessage(obj: unknown): obj is TranscriptMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const message = obj as Record<string, unknown>;

  // Check required fields
  if (typeof message['role'] !== 'string') {
    return false;
  }
  if (message['role'] !== 'user' && message['role'] !== 'assistant') {
    return false;
  }
  if (typeof message['content'] !== 'string') {
    return false;
  }
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
 * Parse transcript input from JSON string
 * Validates that all messages have required fields (role, content, timestamp)
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

  // Validate each message in the transcript
  const validatedMessages: TranscriptMessage[] = [];
  for (let i = 0; i < obj['transcript'].length; i++) {
    const message = obj['transcript'][i];
    if (!isValidTranscriptMessage(message)) {
      throw new Error(
        `Invalid transcript message at index ${i}: must have role ('user' | 'assistant'), content (string), and timestamp (ISO date string)`
      );
    }
    validatedMessages.push(message);
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
 * Analyze messages for memory-worthy content
 * Returns suggested memories based on content analysis
 */
export function analyzeForMemories(
  messages: TranscriptMessage[]
): Array<{
  subject: string;
  keywords: string[];
  applies_to: string;
  content: string;
}> {
  const memories: Array<{
    subject: string;
    keywords: string[];
    applies_to: string;
    content: string;
  }> = [];

  // Patterns that indicate memory-worthy content
  const patterns = {
    decision: /(?:decided|decision|chose|approach|strategy|pattern)[\s:]+(.+)/gi,
    solution: /(?:fixed|solved|solution|resolved|fix was|issue was)[\s:]+(.+)/gi,
    configuration: /(?:configured?|setting|config|environment|\.env)[\s:]+(.+)/gi,
    convention: /(?:convention|pattern|always|never|standard|rule)[\s:]+(.+)/gi,
    important: /(?:important|note|remember|don'?t forget)[\s:]+(.+)/gi,
  };

  for (const message of messages) {
    // Only analyze assistant messages (Claude's responses)
    if (message.role !== 'assistant') {
      continue;
    }

    const content = message.content;

    // Check for decision patterns
    for (const [category, pattern] of Object.entries(patterns)) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const matchedContent = match[1]?.trim();
        if (matchedContent && matchedContent.length > 20) {
          memories.push({
            subject: generateSubject(category, matchedContent),
            keywords: generateKeywords(category, matchedContent),
            applies_to: 'global',
            content: matchedContent,
          });
        }
      }
    }

    // Check for file-specific mentions
    const filePattern = /(?:in|file|at)\s+[`"]?([^`"\s]+\.[a-z]+)[`"]?/gi;
    const fileMatches = content.matchAll(filePattern);
    for (const match of fileMatches) {
      const filePath = match[1];
      // Skip if index is missing (should not happen with matchAll)
      if (typeof match.index !== 'number') {
        continue;
      }
      if (filePath && !filePath.includes('*')) {
        // Extract context around the file mention
        const fileContext = extractContextAroundMatch(content, match.index);
        if (fileContext.length > 30) {
          memories.push({
            subject: `Note about ${filePath}`,
            keywords: generateKeywordsForFile(filePath, fileContext),
            applies_to: `file:${filePath}`,
            content: fileContext,
          });
        }
      }
    }
  }

  // Deduplicate by subject
  const seen = new Set<string>();
  return memories.filter((m) => {
    const key = m.subject.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Generate a subject line from category and content
 */
function generateSubject(category: string, content: string): string {
  const prefix = {
    decision: 'Decision:',
    solution: 'Fix:',
    configuration: 'Config:',
    convention: 'Convention:',
    important: 'Note:',
  }[category] ?? 'Memory:';

  // Take first sentence or first 50 chars
  const firstSentence = content.split(/[.!?]/)[0] ?? content;
  const truncated =
    firstSentence.length > 50
      ? firstSentence.slice(0, 47) + '...'
      : firstSentence;

  return `${prefix} ${truncated}`;
}

/**
 * Generate keywords from category and content
 * Uses extractKeywordsFromText from markdown.ts for consistent RAKE-based extraction
 */
function generateKeywords(category: string, content: string): string[] {
  // Start with the category as the first keyword
  const keywords = [category];
  const seen = new Set(keywords);

  // Extract keywords from content using RAKE algorithm (via markdown.ts)
  const extractedKeywords = extractKeywordsFromText(content, {
    maxKeywords: 10,
    minLength: 3,
  });

  // Add extracted keywords (up to 4 more, for a total of 5)
  for (const keyword of extractedKeywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (!seen.has(normalizedKeyword) && keywords.length < 5) {
      keywords.push(normalizedKeyword);
      seen.add(normalizedKeyword);
    }
  }

  return keywords;
}

/**
 * Generate keywords for a file-specific memory
 * Combines path-based keywords with content-based keywords
 */
function generateKeywordsForFile(filePath: string, content: string): string[] {
  const keywords: string[] = [];
  const seen = new Set<string>();

  // Extract keywords from the file path
  const pathParts = filePath.split(/[\/\\.]/).filter(Boolean);
  const pathKeywords = pathParts.filter((p) => p.length > 2).slice(-3);

  for (const keyword of pathKeywords) {
    const normalized = keyword.toLowerCase();
    if (!seen.has(normalized)) {
      keywords.push(normalized);
      seen.add(normalized);
    }
  }

  // Add the file extension
  const ext = filePath.split('.').pop();
  if (ext && ext.length <= 4 && !seen.has(ext.toLowerCase())) {
    keywords.push(ext.toLowerCase());
    seen.add(ext.toLowerCase());
  }

  // Extract keywords from the content using RAKE algorithm
  const contentKeywords = extractKeywordsFromText(content, {
    maxKeywords: 5,
    minLength: 3,
  });

  // Add content keywords (up to total of 5)
  for (const keyword of contentKeywords) {
    const normalized = keyword.toLowerCase();
    if (!seen.has(normalized) && keywords.length < 5) {
      keywords.push(normalized);
      seen.add(normalized);
    }
  }

  return keywords;
}

/**
 * Extract context around a match position
 */
function extractContextAroundMatch(
  content: string,
  position: number,
  contextSize: number = 200
): string {
  const start = Math.max(0, position - contextSize);
  const end = Math.min(content.length, position + contextSize);

  let extracted = content.slice(start, end);

  // Try to start at a sentence boundary
  if (start > 0) {
    const sentenceStart = extracted.indexOf('. ');
    if (sentenceStart !== -1 && sentenceStart < SENTENCE_BOUNDARY_SEARCH_LIMIT) {
      extracted = extracted.slice(sentenceStart + 2);
    } else {
      extracted = '...' + extracted;
    }
  }

  // Try to end at a sentence boundary
  if (end < content.length) {
    const sentenceEnd = extracted.lastIndexOf('. ');
    if (sentenceEnd !== -1 && sentenceEnd > extracted.length - SENTENCE_BOUNDARY_SEARCH_LIMIT) {
      extracted = extracted.slice(0, sentenceEnd + 1);
    } else {
      extracted = extracted + '...';
    }
  }

  return extracted.trim();
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
