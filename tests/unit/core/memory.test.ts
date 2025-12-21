import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { MemoryManager } from '../../../src/core/memory.js';

describe('MemoryManager', () => {
  let testDir: string;
  let storeDir: string; // episodic-memory subdirectory where JSONL files are stored
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-test-'));
    storeDir = path.join(testDir, 'episodic-memory');
    // Set environment variable for config
    process.env['LOCAL_RECALL_DIR'] = testDir;
    memoryManager = new MemoryManager(testDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('createMemory', () => {
    it('should create a new memory with valid input', async () => {
      const input = {
        subject: 'Test memory',
        keywords: ['test', 'memory', 'unit'],
        applies_to: 'global' as const,
        content: 'This is a test memory content.',
      };

      const memory = await memoryManager.createMemory(input);

      expect(memory.id).toBeDefined();
      expect(memory.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(memory.subject).toBe(input.subject);
      expect(memory.keywords).toEqual(input.keywords);
      expect(memory.applies_to).toBe(input.applies_to);
      expect(memory.content).toBe(input.content);
      expect(memory.occurred_at).toBeDefined();
    });

    it('should create memory in JSONL file on disk', async () => {
      const input = {
        subject: 'Disk test',
        keywords: ['disk'],
        applies_to: 'global' as const,
        content: 'Testing disk write.',
      };

      const memory = await memoryManager.createMemory(input);
      const filePath = path.join(storeDir, 'episodic-000001.jsonl');

      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Verify the memory is in the JSONL file
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain(memory.id);
      expect(content).toContain('"action":"add"');
    });

    it('should create memory with file scope', async () => {
      const input = {
        subject: 'File-scoped memory',
        keywords: ['file', 'scope'],
        applies_to: 'file:/src/test.ts' as const,
        content: 'Memory for a specific file.',
      };

      const memory = await memoryManager.createMemory(input);

      expect(memory.applies_to).toBe('file:/src/test.ts');
    });

    it('should create memory with area scope', async () => {
      const input = {
        subject: 'Area-scoped memory',
        keywords: ['area', 'scope'],
        applies_to: 'area:authentication' as const,
        content: 'Memory for authentication area.',
      };

      const memory = await memoryManager.createMemory(input);

      expect(memory.applies_to).toBe('area:authentication');
    });

    it('should reject invalid input', async () => {
      const invalidInput = {
        subject: '', // Empty subject should fail
        keywords: ['test'],
        applies_to: 'global' as const,
        content: 'Content',
      };

      await expect(memoryManager.createMemory(invalidInput)).rejects.toThrow();
    });

    it('should reject too many keywords', async () => {
      const tooManyKeywords = Array.from({ length: 25 }, (_, i) => `keyword${i}`);
      const invalidInput = {
        subject: 'Test',
        keywords: tooManyKeywords,
        applies_to: 'global' as const,
        content: 'Content',
      };

      await expect(memoryManager.createMemory(invalidInput)).rejects.toThrow();
    });
  });

  describe('getMemory', () => {
    it('should retrieve an existing memory', async () => {
      const input = {
        subject: 'Retrieve test',
        keywords: ['retrieve'],
        applies_to: 'global' as const,
        content: 'Content to retrieve.',
      };

      const created = await memoryManager.createMemory(input);
      const retrieved = await memoryManager.getMemory(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.subject).toBe(created.subject);
      expect(retrieved?.content).toBe(created.content);
    });

    it('should return null for non-existent memory', async () => {
      const result = await memoryManager.getMemory('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('deleteMemory', () => {
    it('should delete an existing memory', async () => {
      const created = await memoryManager.createMemory({
        subject: 'To be deleted',
        keywords: ['delete'],
        applies_to: 'global' as const,
        content: 'This will be deleted.',
      });

      const deleted = await memoryManager.deleteMemory(created.id);

      expect(deleted).toBe(true);

      const retrieved = await memoryManager.getMemory(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent memory', async () => {
      const result = await memoryManager.deleteMemory('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('listMemories', () => {
    it('should list all memories', async () => {
      await memoryManager.createMemory({
        subject: 'Memory 1',
        keywords: ['one'],
        applies_to: 'global' as const,
        content: 'First memory.',
      });

      await memoryManager.createMemory({
        subject: 'Memory 2',
        keywords: ['two'],
        applies_to: 'global' as const,
        content: 'Second memory.',
      });

      const memories = await memoryManager.listMemories();

      expect(memories).toHaveLength(2);
    });

    it('should filter by scope', async () => {
      await memoryManager.createMemory({
        subject: 'Global memory',
        keywords: ['global'],
        applies_to: 'global' as const,
        content: 'Global scope.',
      });

      await memoryManager.createMemory({
        subject: 'File memory',
        keywords: ['file'],
        applies_to: 'file:/test.ts' as const,
        content: 'File scope.',
      });

      const globalMemories = await memoryManager.listMemories({ scope: 'global' });
      const fileMemories = await memoryManager.listMemories({ scope: 'file:/test.ts' });

      expect(globalMemories).toHaveLength(1);
      expect(globalMemories[0]?.subject).toBe('Global memory');
      expect(fileMemories).toHaveLength(1);
      expect(fileMemories[0]?.subject).toBe('File memory');
    });

    it('should filter by keyword', async () => {
      await memoryManager.createMemory({
        subject: 'Has keyword',
        keywords: ['special', 'test'],
        applies_to: 'global' as const,
        content: 'Has special keyword.',
      });

      await memoryManager.createMemory({
        subject: 'No special keyword',
        keywords: ['test'],
        applies_to: 'global' as const,
        content: 'No special keyword.',
      });

      const filtered = await memoryManager.listMemories({ keyword: 'special' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.subject).toBe('Has keyword');
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await memoryManager.createMemory({
          subject: `Memory ${i}`,
          keywords: ['page'],
          applies_to: 'global' as const,
          content: `Memory number ${i}.`,
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
