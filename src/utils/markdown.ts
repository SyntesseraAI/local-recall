import matter from 'gray-matter';
import type { Memory, MemoryFrontmatter } from '../core/types.js';

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
    created_at: memory.created_at,
    updated_at: memory.updated_at,
  };

  return matter.stringify(memory.content, frontmatter);
}

/**
 * Extract keywords from text content
 * Useful for auto-suggesting keywords from memory content
 */
export function extractKeywordsFromText(
  text: string,
  options: { maxKeywords?: number; minLength?: number } = {}
): string[] {
  const maxKeywords = options.maxKeywords ?? 10;
  const minLength = options.minLength ?? 3;

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'also', 'now', 'this', 'that', 'these', 'those',
  ]);

  // Extract words
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= minLength && !stopWords.has(word));

  // Count frequency
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
    `**Updated:** ${memory.updated_at}`,
    '',
    '---',
    '',
    memory.content,
  ];

  return lines.join('\n');
}
