import matter from 'gray-matter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const keywordExtractor = require('keyword-extractor') as {
  extract: (str: string, options?: {
    language?: string;
    remove_digits?: boolean;
    return_changed_case?: boolean;
    remove_duplicates?: boolean;
  }) => string[];
};
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
    occurred_at: memory.occurred_at,
    content_hash: memory.content_hash,
  };

  return matter.stringify(memory.content, frontmatter);
}

/**
 * Extract keywords from text content using keyword-extractor
 *
 * Uses stop word removal and returns unique keywords from the text.
 * More sophisticated than simple frequency analysis.
 */
export function extractKeywordsFromText(
  text: string,
  options: { maxKeywords?: number; minLength?: number; additionalStopWords?: string[] } = {}
): string[] {
  const maxKeywords = options.maxKeywords ?? 10;
  const minLength = options.minLength ?? 3;

  // Use keyword-extractor for better keyword extraction
  const extracted = keywordExtractor.extract(text, {
    language: 'english',
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: false, // We'll handle deduplication with frequency
  });

  // Filter by minimum length and additional stop words
  const additionalStops = new Set(
    (options.additionalStopWords ?? []).map(w => w.toLowerCase())
  );

  const filtered = extracted.filter(
    (word: string) => word.length >= minLength && !additionalStops.has(word)
  );

  // Count frequency to rank keywords
  const frequency = new Map<string, number>();
  for (const word of filtered) {
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
