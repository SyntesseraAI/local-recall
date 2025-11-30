import { describe, it, expect } from 'vitest';
import {
  parseMarkdown,
  serializeMemory,
  extractKeywordsFromText,
  formatMemoryForDisplay,
} from '../../../src/utils/markdown.js';
import type { Memory } from '../../../src/core/types.js';

describe('markdown utilities', () => {
  describe('parseMarkdown', () => {
    it('should parse markdown with YAML frontmatter', () => {
      const content = `---
title: Test Title
keywords:
  - one
  - two
---

# Body Content

This is the body.`;

      const result = parseMarkdown(content);

      expect(result.frontmatter['title']).toBe('Test Title');
      expect(result.frontmatter['keywords']).toEqual(['one', 'two']);
      expect(result.body).toContain('# Body Content');
      expect(result.body).toContain('This is the body.');
    });

    it('should handle markdown without frontmatter', () => {
      const content = '# Just a heading\n\nSome text.';

      const result = parseMarkdown(content);

      expect(result.frontmatter).toEqual({});
      expect(result.body).toBe('# Just a heading\n\nSome text.');
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---

Content only.`;

      const result = parseMarkdown(content);

      expect(result.frontmatter).toEqual({});
      expect(result.body).toBe('Content only.');
    });

    it('should trim body content', () => {
      const content = `---
key: value
---

  Content with spaces

`;

      const result = parseMarkdown(content);

      expect(result.body).toBe('Content with spaces');
    });
  });

  describe('serializeMemory', () => {
    it('should serialize memory to markdown with frontmatter', () => {
      const memory: Memory = {
        id: 'test-id-123',
        subject: 'Test Subject',
        keywords: ['keyword1', 'keyword2'],
        applies_to: 'global',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-02T00:00:00.000Z',
        content_hash: 'abc123def456',
        content: 'Test content here.',
      };

      const result = serializeMemory(memory);

      expect(result).toContain('id: test-id-123');
      expect(result).toContain('subject: Test Subject');
      expect(result).toContain('- keyword1');
      expect(result).toContain('- keyword2');
      expect(result).toContain('applies_to: global');
      expect(result).toContain('Test content here.');
    });

    it('should handle file scope', () => {
      const memory: Memory = {
        id: 'file-memory',
        subject: 'File Memory',
        keywords: ['file'],
        applies_to: 'file:/src/test.ts',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-01T00:00:00.000Z',
        content_hash: 'file123hash',
        content: 'File-specific content.',
      };

      const result = serializeMemory(memory);

      // YAML uses single quotes for strings with colons
      expect(result).toContain("applies_to: 'file:/src/test.ts'");
    });

    it('should handle area scope', () => {
      const memory: Memory = {
        id: 'area-memory',
        subject: 'Area Memory',
        keywords: ['area'],
        applies_to: 'area:authentication',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-01T00:00:00.000Z',
        content_hash: 'area456hash',
        content: 'Area-specific content.',
      };

      const result = serializeMemory(memory);

      // YAML uses single quotes for strings with colons
      expect(result).toContain("applies_to: 'area:authentication'");
    });

    it('should produce parseable output', () => {
      const memory: Memory = {
        id: 'round-trip-id',
        subject: 'Round Trip Test',
        keywords: ['round', 'trip'],
        applies_to: 'global',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-01T00:00:00.000Z',
        content_hash: 'roundtrip789',
        content: 'Content for round trip.',
      };

      const serialized = serializeMemory(memory);
      const parsed = parseMarkdown(serialized);

      expect(parsed.frontmatter['id']).toBe(memory.id);
      expect(parsed.frontmatter['subject']).toBe(memory.subject);
      expect(parsed.body).toBe(memory.content);
    });
  });

  describe('extractKeywordsFromText', () => {
    it('should extract keywords from text', () => {
      const text = 'TypeScript is a strongly typed programming language that builds on JavaScript.';

      const keywords = extractKeywordsFromText(text);

      expect(keywords.length).toBeGreaterThan(0);
      // Should extract meaningful words
      expect(keywords.some((k) => k.toLowerCase().includes('typescript'))).toBe(true);
    });

    it('should respect maxKeywords option', () => {
      const text = 'The quick brown fox jumps over the lazy dog near the river bank.';

      const keywords = extractKeywordsFromText(text, { maxKeywords: 3 });

      expect(keywords.length).toBeLessThanOrEqual(3);
    });

    it('should respect minLength option', () => {
      const text = 'A cat and a dog in the big house.';

      const keywords = extractKeywordsFromText(text, { minLength: 4 });

      keywords.forEach((keyword) => {
        expect(keyword.length).toBeGreaterThanOrEqual(4);
      });
    });

    it('should handle empty text', () => {
      const keywords = extractKeywordsFromText('');

      expect(keywords).toEqual([]);
    });

    it('should handle text with only stop words', () => {
      const text = 'the and or but if then';

      const keywords = extractKeywordsFromText(text);

      // Should return empty or very few keywords since all are stop words
      expect(keywords.length).toBeLessThanOrEqual(2);
    });

    it('should handle technical content', () => {
      const text = 'Configure the database connection using environment variables for the API server.';

      const keywords = extractKeywordsFromText(text);

      expect(keywords.length).toBeGreaterThan(0);
    });
  });

  describe('formatMemoryForDisplay', () => {
    it('should format memory for human-readable display', () => {
      const memory: Memory = {
        id: 'display-id',
        subject: 'Display Test',
        keywords: ['display', 'test'],
        applies_to: 'global',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-02T00:00:00.000Z',
        content_hash: 'display123hash',
        content: 'This is the memory content.',
      };

      const result = formatMemoryForDisplay(memory);

      expect(result).toContain('## Display Test');
      expect(result).toContain('**ID:** display-id');
      expect(result).toContain('**Scope:** global');
      expect(result).toContain('**Keywords:** display, test');
      expect(result).toContain('**Occurred:** 2024-01-02T00:00:00.000Z');
      expect(result).toContain('This is the memory content.');
    });

    it('should include separator', () => {
      const memory: Memory = {
        id: 'sep-id',
        subject: 'Separator Test',
        keywords: ['sep'],
        applies_to: 'global',
        created_at: '2024-01-01T00:00:00.000Z',
        occurred_at: '2024-01-01T00:00:00.000Z',
        content_hash: 'sep123hash',
        content: 'Content.',
      };

      const result = formatMemoryForDisplay(memory);

      expect(result).toContain('---');
    });
  });
});
