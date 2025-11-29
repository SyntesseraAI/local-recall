import type { TranscriptMessage, TranscriptInput } from '../core/types.js';

/**
 * Parse transcript input from JSON string
 */
export function parseTranscript(input: string): TranscriptInput {
  const data = JSON.parse(input);

  if (!data.transcript || !Array.isArray(data.transcript)) {
    throw new Error('Invalid transcript input: missing transcript array');
  }

  return {
    transcript: data.transcript as TranscriptMessage[],
    session_id: data.session_id ?? 'unknown',
    working_directory: data.working_directory ?? process.cwd(),
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
      if (filePath && !filePath.includes('*')) {
        // Extract context around the file mention
        const fileContext = extractContextAroundMatch(content, match.index ?? 0);
        if (fileContext.length > 30) {
          memories.push({
            subject: `Note about ${filePath}`,
            keywords: extractKeywordsFromPath(filePath),
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
 */
function generateKeywords(category: string, content: string): string[] {
  const keywords = [category];

  // Extract potential keywords from content
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // Add first few unique words
  const seen = new Set(keywords);
  for (const word of words) {
    if (!seen.has(word) && keywords.length < 5) {
      keywords.push(word);
      seen.add(word);
    }
  }

  return keywords;
}

/**
 * Extract keywords from a file path
 */
function extractKeywordsFromPath(filePath: string): string[] {
  const parts = filePath.split(/[\/\\.]/).filter(Boolean);
  const keywords = parts
    .filter((p) => p.length > 2)
    .slice(-3); // Last 3 meaningful parts

  // Add the file extension without dot
  const ext = filePath.split('.').pop();
  if (ext && ext.length <= 4) {
    keywords.push(ext);
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
    if (sentenceStart !== -1 && sentenceStart < 50) {
      extracted = extracted.slice(sentenceStart + 2);
    } else {
      extracted = '...' + extracted;
    }
  }

  // Try to end at a sentence boundary
  if (end < content.length) {
    const sentenceEnd = extracted.lastIndexOf('. ');
    if (sentenceEnd !== -1 && sentenceEnd > extracted.length - 50) {
      extracted = extracted.slice(0, sentenceEnd + 1);
    } else {
      extracted = extracted + '...';
    }
  }

  return extracted.trim();
}

/**
 * Read from stdin (for hook scripts)
 */
export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.on('error', reject);
  });
}
