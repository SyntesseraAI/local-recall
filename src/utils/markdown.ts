import matter from 'gray-matter';
import type { Memory, MemoryFrontmatter, ThinkingMemory, ThinkingMemoryFrontmatter } from '../core/types.js';

/**
 * Common English stop words to filter out from keyword extraction
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  'once', 'if', 'else', 'because', 'while', 'although', 'though', 'after',
  'before', 'above', 'below', 'between', 'into', 'through', 'during',
  'about', 'against', 'without', 'within', 'along', 'following', 'across',
  'behind', 'beyond', 'plus', 'except', 'up', 'out', 'around', 'down',
  'off', 'over', 'under', 'again', 'further', 'any', 'our', 'your', 'my',
  'his', 'her', 'their', 'me', 'him', 'us', 'them', 'myself', 'yourself',
  'himself', 'herself', 'itself', 'ourselves', 'themselves', 'being',
  'having', 'doing', 'get', 'got', 'getting', 'let', 'lets', 'make',
  'made', 'making', 'take', 'took', 'taking', 'come', 'came', 'coming',
  'go', 'went', 'going', 'see', 'saw', 'seeing', 'know', 'knew', 'knowing',
  'think', 'thought', 'thinking', 'say', 'said', 'saying', 'tell', 'told',
  'telling', 'ask', 'asked', 'asking', 'use', 'using', 'try', 'tried',
  'trying', 'want', 'wanted', 'wanting', 'look', 'looked', 'looking',
  'give', 'gave', 'giving', 'keep', 'kept', 'keeping', 'put', 'putting',
]);

/**
 * Parse markdown content with YAML frontmatter
 */
export function parseMarkdown(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const { data, content: body } = matter(content);
  return {
    frontmatter: data,
    body: body.trim(),
  };
}

/**
 * Serialize a memory to markdown with frontmatter
 */
export function serializeMemory(memory: Memory): string {
  const frontmatter: MemoryFrontmatter = {
    id: memory.id,
    subject: memory.subject,
    keywords: memory.keywords,
    applies_to: memory.applies_to,
    occurred_at: memory.occurred_at,
    content_hash: memory.content_hash,
  };

  return matter.stringify(memory.content, frontmatter);
}

/**
 * Extract keywords from text content
 *
 * Uses stop word removal and returns unique keywords ranked by frequency.
 */
export function extractKeywordsFromText(
  text: string,
  options: { maxKeywords?: number; minLength?: number; additionalStopWords?: string[] } = {}
): string[] {
  const maxKeywords = options.maxKeywords ?? 10;
  const minLength = options.minLength ?? 3;

  // Build combined stop words set
  const additionalStops = new Set(
    (options.additionalStopWords ?? []).map(w => w.toLowerCase())
  );

  // Extract words: lowercase, split on non-alphanumeric, filter
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) =>
      word.length >= minLength &&
      !STOP_WORDS.has(word) &&
      !additionalStops.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    );

  // Count frequency to rank keywords
  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  // Sort by frequency and return top keywords
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Format memory content for display
 */
export function formatMemoryForDisplay(memory: Memory): string {
  const lines: string[] = [
    `## ${memory.subject}`,
    '',
    `**ID:** ${memory.id}`,
    `**Scope:** ${memory.applies_to}`,
    `**Keywords:** ${memory.keywords.join(', ')}`,
    `**Occurred:** ${memory.occurred_at}`,
    '',
    '---',
    '',
    memory.content,
  ];

  return lines.join('\n');
}

/**
 * Serialize a thinking memory to markdown with frontmatter (no keywords)
 */
export function serializeThinkingMemory(memory: ThinkingMemory): string {
  const frontmatter: ThinkingMemoryFrontmatter = {
    id: memory.id,
    subject: memory.subject,
    applies_to: memory.applies_to,
    occurred_at: memory.occurred_at,
    content_hash: memory.content_hash,
  };

  return matter.stringify(memory.content, frontmatter);
}

/**
 * Format thinking memory content for display (no keywords)
 */
export function formatThinkingMemoryForDisplay(memory: ThinkingMemory): string {
  const lines: string[] = [
    `## ${memory.subject}`,
    '',
    `**ID:** ${memory.id}`,
    `**Scope:** ${memory.applies_to}`,
    `**Occurred:** ${memory.occurred_at}`,
    '',
    '---',
    '',
    memory.content,
  ];

  return lines.join('\n');
}
