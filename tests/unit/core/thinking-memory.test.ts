import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ThinkingMemoryManager, generateSubjectFromContent } from '../../../src/core/thinking-memory.js';

describe('ThinkingMemoryManager', () => {
  let testDir: string;
  let memoryManager: ThinkingMemoryManager;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-thinking-test-'));
    // Set environment variable for config
    process.env['LOCAL_RECALL_DIR'] = testDir;
    memoryManager = new ThinkingMemoryManager(testDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('createMemory', () => {
    it('should create a new thinking memory with valid input', async () => {
      const input = {
        subject: 'Test thinking memory',
        applies_to: 'global' as const,
        content: 'This is a test thinking memory content with enough characters.',
      };

      const memory = await memoryManager.createMemory(input);

      expect(memory.id).toBeDefined();
      expect(memory.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(memory.subject).toBe(input.subject);
      expect(memory.applies_to).toBe(input.applies_to);
      expect(memory.content).toBe(input.content);
      expect(memory.occurred_at).toBeDefined();
      // Thinking memories should NOT have keywords
      expect((memory as any).keywords).toBeUndefined();
    });

    it('should create thinking memory file on disk', async () => {
      const input = {
        subject: 'Disk test',
        applies_to: 'global' as const,
        content: 'Testing disk write for thinking memory.',
      };

      const memory = await memoryManager.createMemory(input);
      const filePath = path.join(testDir, 'thinking-memory', `${memory.id}.md`);

      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should create thinking memory with file scope', async () => {
      const input = {
        subject: 'File-scoped thinking memory',
        applies_to: 'file:/src/test.ts' as const,
        content: 'Thinking memory for a specific file.',
      };

      const memory = await memoryManager.createMemory(input);

      expect(memory.applies_to).toBe('file:/src/test.ts');
    });

    it('should reject invalid input', async () => {
      const invalidInput = {
        subject: '', // Empty subject should fail
        applies_to: 'global' as const,
        content: 'Content',
      };

      await expect(memoryManager.createMemory(invalidInput)).rejects.toThrow();
    });

    it('should return existing memory if duplicate', async () => {
      const input = {
        subject: 'Duplicate test',
        applies_to: 'global' as const,
        content: 'This is duplicate content.',
        occurred_at: '2025-01-01T00:00:00.000Z',
      };

      const first = await memoryManager.createMemory(input);
      const second = await memoryManager.createMemory(input);

      expect(second.id).toBe(first.id);
    });
  });

  describe('getMemory', () => {
    it('should retrieve an existing thinking memory', async () => {
      const input = {
        subject: 'Retrieve test',
        applies_to: 'global' as const,
        content: 'Content to retrieve from thinking memory.',
      };

      const created = await memoryManager.createMemory(input);
      const retrieved = await memoryManager.getMemory(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.subject).toBe(created.subject);
      expect(retrieved?.content).toBe(created.content);
    });

    it('should return null for non-existent thinking memory', async () => {
      const result = await memoryManager.getMemory('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('deleteMemory', () => {
    it('should delete an existing thinking memory', async () => {
      const created = await memoryManager.createMemory({
        subject: 'To be deleted',
        applies_to: 'global' as const,
        content: 'This thinking memory will be deleted.',
      });

      const deleted = await memoryManager.deleteMemory(created.id);

      expect(deleted).toBe(true);

      const retrieved = await memoryManager.getMemory(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent thinking memory', async () => {
      const result = await memoryManager.deleteMemory('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('listMemories', () => {
    it('should list all thinking memories', async () => {
      await memoryManager.createMemory({
        subject: 'Memory 1',
        applies_to: 'global' as const,
        content: 'First thinking memory.',
      });

      await memoryManager.createMemory({
        subject: 'Memory 2',
        applies_to: 'global' as const,
        content: 'Second thinking memory.',
      });

      const memories = await memoryManager.listMemories();

      expect(memories).toHaveLength(2);
    });

    it('should filter by scope', async () => {
      await memoryManager.createMemory({
        subject: 'Global thinking memory',
        applies_to: 'global' as const,
        content: 'Global scope thinking.',
      });

      await memoryManager.createMemory({
        subject: 'File thinking memory',
        applies_to: 'file:/test.ts' as const,
        content: 'File scope thinking.',
      });

      const globalMemories = await memoryManager.listMemories({ scope: 'global' });
      const fileMemories = await memoryManager.listMemories({ scope: 'file:/test.ts' });

      expect(globalMemories).toHaveLength(1);
      expect(globalMemories[0]?.subject).toBe('Global thinking memory');
      expect(fileMemories).toHaveLength(1);
      expect(fileMemories[0]?.subject).toBe('File thinking memory');
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await memoryManager.createMemory({
          subject: `Memory ${i}`,
          applies_to: 'global' as const,
          content: `Thinking memory number ${i}.`,
        });
      }

      const page1 = await memoryManager.listMemories({ limit: 2, offset: 0 });
      const page2 = await memoryManager.listMemories({ limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0]?.id).not.toBe(page2[0]?.id);
    });

    it('should return empty array when no memories exist', async () => {
      const memories = await memoryManager.listMemories();
      expect(memories).toEqual([]);
    });
  });
});

describe('generateSubjectFromContent', () => {
  it('should return short content as-is', () => {
    const content = 'Short thinking content';
    const subject = generateSubjectFromContent(content);
    expect(subject).toBe('Short thinking content');
  });

  it('should truncate long content at word boundary', () => {
    const content = 'This is a very long thinking content that should be truncated at a reasonable word boundary to fit within the maximum length allowed for a subject line';
    const subject = generateSubjectFromContent(content, 50);
    expect(subject.length).toBeLessThanOrEqual(53); // 50 + "..."
    expect(subject.endsWith('...')).toBe(true);
  });

  it('should handle multi-line content', () => {
    const content = 'First line\nSecond line\nThird line';
    const subject = generateSubjectFromContent(content);
    expect(subject).toBe('First line Second line Third line');
  });

  it('should handle extra whitespace', () => {
    const content = '  Multiple   spaces   and   stuff  ';
    const subject = generateSubjectFromContent(content);
    expect(subject).toBe('Multiple spaces and stuff');
  });
});
