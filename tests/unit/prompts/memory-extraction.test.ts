import { describe, it, expect } from 'vitest';
import {
  buildMemoryExtractionPrompt,
  extractedMemorySchema,
  extractedMemoriesSchema,
  MEMORY_EXTRACTION_JSON_SCHEMA,
} from '../../../src/prompts/memory-extraction.js';

describe('memory-extraction', () => {
  describe('buildMemoryExtractionPrompt', () => {
    it('should include project path in prompt', () => {
      const prompt = buildMemoryExtractionPrompt('transcript content', '/path/to/project');

      expect(prompt).toContain('/path/to/project');
      expect(prompt).toContain('Working directory:');
    });

    it('should include transcript content in prompt', () => {
      const transcriptContent = 'This is my transcript JSONL content';
      const prompt = buildMemoryExtractionPrompt(transcriptContent, '/project');

      expect(prompt).toContain(transcriptContent);
    });

    it('should include memory extraction guidelines', () => {
      const prompt = buildMemoryExtractionPrompt('content', '/project');

      expect(prompt).toContain('What have you learnt');
      expect(prompt).toContain('What do you know now');
      expect(prompt).toContain('What is specific to this codebase');
      expect(prompt).toContain('What problems did you solve');
    });

    it('should include scope documentation', () => {
      const prompt = buildMemoryExtractionPrompt('content', '/project');

      expect(prompt).toContain('global');
      expect(prompt).toContain('file:<path>');
      expect(prompt).toContain('area:<name>');
    });

    it('should include output format instructions', () => {
      const prompt = buildMemoryExtractionPrompt('content', '/project');

      expect(prompt).toContain('subject');
      expect(prompt).toContain('keywords');
      expect(prompt).toContain('applies_to');
      expect(prompt).toContain('content');
      expect(prompt).toContain('memories');
    });
  });

  describe('extractedMemorySchema', () => {
    it('should validate a valid memory object', () => {
      const validMemory = {
        subject: 'Test memory subject',
        keywords: ['test', 'memory'],
        applies_to: 'global',
        content: 'This is the memory content with enough characters.',
      };

      const result = extractedMemorySchema.safeParse(validMemory);
      expect(result.success).toBe(true);
    });

    it('should reject memory with empty subject', () => {
      const invalidMemory = {
        subject: '',
        keywords: ['test'],
        applies_to: 'global',
        content: 'Valid content here.',
      };

      const result = extractedMemorySchema.safeParse(invalidMemory);
      expect(result.success).toBe(false);
    });

    it('should reject memory with too long subject', () => {
      const invalidMemory = {
        subject: 'x'.repeat(201),
        keywords: ['test'],
        applies_to: 'global',
        content: 'Valid content here.',
      };

      const result = extractedMemorySchema.safeParse(invalidMemory);
      expect(result.success).toBe(false);
    });

    it('should reject memory with empty keywords', () => {
      const invalidMemory = {
        subject: 'Valid subject',
        keywords: [],
        applies_to: 'global',
        content: 'Valid content here.',
      };

      const result = extractedMemorySchema.safeParse(invalidMemory);
      expect(result.success).toBe(false);
    });

    it('should reject memory with too many keywords', () => {
      const invalidMemory = {
        subject: 'Valid subject',
        keywords: Array.from({ length: 11 }, (_, i) => `keyword${i}`),
        applies_to: 'global',
        content: 'Valid content here.',
      };

      const result = extractedMemorySchema.safeParse(invalidMemory);
      expect(result.success).toBe(false);
    });

    it('should reject memory with too short content', () => {
      const invalidMemory = {
        subject: 'Valid subject',
        keywords: ['test'],
        applies_to: 'global',
        content: 'Short',
      };

      const result = extractedMemorySchema.safeParse(invalidMemory);
      expect(result.success).toBe(false);
    });
  });

  describe('extractedMemoriesSchema', () => {
    it('should validate an empty memories array', () => {
      const result = extractedMemoriesSchema.safeParse({ memories: [] });
      expect(result.success).toBe(true);
    });

    it('should validate multiple memories', () => {
      const validMemories = {
        memories: [
          {
            subject: 'First memory',
            keywords: ['first'],
            applies_to: 'global',
            content: 'First memory content here.',
          },
          {
            subject: 'Second memory',
            keywords: ['second'],
            applies_to: 'file:/src/test.ts',
            content: 'Second memory content here.',
          },
        ],
      };

      const result = extractedMemoriesSchema.safeParse(validMemories);
      expect(result.success).toBe(true);
    });

    it('should reject if any memory is invalid', () => {
      const invalidMemories = {
        memories: [
          {
            subject: 'Valid memory',
            keywords: ['valid'],
            applies_to: 'global',
            content: 'Valid content here.',
          },
          {
            subject: '', // Invalid
            keywords: ['invalid'],
            applies_to: 'global',
            content: 'Some content.',
          },
        ],
      };

      const result = extractedMemoriesSchema.safeParse(invalidMemories);
      expect(result.success).toBe(false);
    });
  });

  describe('MEMORY_EXTRACTION_JSON_SCHEMA', () => {
    it('should have correct structure', () => {
      expect(MEMORY_EXTRACTION_JSON_SCHEMA.type).toBe('object');
      expect(MEMORY_EXTRACTION_JSON_SCHEMA.properties.memories).toBeDefined();
      expect(MEMORY_EXTRACTION_JSON_SCHEMA.properties.memories.type).toBe('array');
    });

    it('should have required fields for memory items', () => {
      const memorySchema = MEMORY_EXTRACTION_JSON_SCHEMA.properties.memories.items;
      expect(memorySchema.required).toContain('subject');
      expect(memorySchema.required).toContain('keywords');
      expect(memorySchema.required).toContain('applies_to');
      expect(memorySchema.required).toContain('content');
    });
  });
});
