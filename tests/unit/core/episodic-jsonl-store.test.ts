import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { EpisodicJsonlStore } from '../../../src/core/episodic-jsonl-store.js';

describe('EpisodicJsonlStore', () => {
  let testDir: string;
  let store: EpisodicJsonlStore;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-test-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    store = new EpisodicJsonlStore({ baseDir: testDir });
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('createMemory', () => {
    it('should create a new memory', async () => {
      const input = {
        subject: 'Test memory',
        keywords: ['test', 'memory'],
        applies_to: 'global' as const,
        content: 'This is a test memory content that is long enough.',
      };

      const memory = await store.createMemory(input);

      expect(memory.id).toBeDefined();
      expect(memory.subject).toBe('Test memory');
      expect(memory.keywords).toEqual(['test', 'memory']);
      expect(memory.applies_to).toBe('global');
      expect(memory.content).toBe(input.content);
      expect(memory.content_hash).toBeDefined();
      expect(memory.occurred_at).toBeDefined();
    });

    it('should persist to JSONL file', async () => {
      const input = {
        subject: 'Persisted memory',
        keywords: ['persist'],
        applies_to: 'global' as const,
        content: 'This memory should be persisted to disk.',
      };

      await store.createMemory(input);

      // Check file exists and contains the memory
      const filePath = path.join(testDir, 'episodic.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(1);
      const entry = JSON.parse(lines[0]);
      expect(entry.action).toBe('add');
      expect(entry.subject).toBe('Persisted memory');
    });

    it('should return existing memory for duplicates', async () => {
      const input = {
        subject: 'Duplicate memory',
        keywords: ['duplicate'],
        applies_to: 'global' as const,
        content: 'This memory will be created twice with same occurred_at.',
        occurred_at: '2024-01-01T00:00:00.000Z',
      };

      const first = await store.createMemory(input);
      const second = await store.createMemory(input);

      expect(first.id).toBe(second.id);

      // Should only have one entry in the file
      const filePath = path.join(testDir, 'episodic.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(1);
    });
  });

  describe('getMemory', () => {
    it('should return memory by ID', async () => {
      const created = await store.createMemory({
        subject: 'Get test',
        keywords: ['get'],
        applies_to: 'global' as const,
        content: 'Memory to retrieve by ID.',
      });

      const retrieved = await store.getMemory(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.subject).toBe('Get test');
    });

    it('should return null for non-existent ID', async () => {
      const retrieved = await store.getMemory('non-existent-uuid');
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteMemory', () => {
    it('should delete a memory', async () => {
      const created = await store.createMemory({
        subject: 'To delete',
        keywords: ['delete'],
        applies_to: 'global' as const,
        content: 'This memory will be deleted.',
      });

      const deleted = await store.deleteMemory(created.id);
      expect(deleted).toBe(true);

      const retrieved = await store.getMemory(created.id);
      expect(retrieved).toBeNull();
    });

    it('should append delete entry to JSONL', async () => {
      const created = await store.createMemory({
        subject: 'To delete',
        keywords: ['delete'],
        applies_to: 'global' as const,
        content: 'This memory will be deleted.',
      });

      await store.deleteMemory(created.id);

      const filePath = path.join(testDir, 'episodic.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[1]).action).toBe('delete');
      expect(JSON.parse(lines[1]).id).toBe(created.id);
    });

    it('should return false for non-existent memory', async () => {
      const deleted = await store.deleteMemory('non-existent-uuid');
      expect(deleted).toBe(false);
    });
  });

  describe('listMemories', () => {
    it('should list all memories', async () => {
      await store.createMemory({
        subject: 'First',
        keywords: ['first'],
        applies_to: 'global' as const,
        content: 'First memory content.',
      });
      await store.createMemory({
        subject: 'Second',
        keywords: ['second'],
        applies_to: 'global' as const,
        content: 'Second memory content.',
      });

      const memories = await store.listMemories();
      expect(memories).toHaveLength(2);
    });

    it('should filter by scope', async () => {
      await store.createMemory({
        subject: 'Global',
        keywords: ['global'],
        applies_to: 'global' as const,
        content: 'Global memory content.',
      });
      await store.createMemory({
        subject: 'File specific',
        keywords: ['file'],
        applies_to: 'file:src/test.ts' as const,
        content: 'File-specific memory content.',
      });

      const globalMemories = await store.listMemories({ scope: 'global' });
      expect(globalMemories).toHaveLength(1);
      expect(globalMemories[0].subject).toBe('Global');
    });

    it('should filter by keyword', async () => {
      await store.createMemory({
        subject: 'Has keyword',
        keywords: ['special', 'common'],
        applies_to: 'global' as const,
        content: 'Memory with special keyword.',
      });
      await store.createMemory({
        subject: 'No special keyword',
        keywords: ['common'],
        applies_to: 'global' as const,
        content: 'Memory without special keyword.',
      });

      const filtered = await store.listMemories({ keyword: 'special' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].subject).toBe('Has keyword');
    });

    it('should sort by occurred_at descending', async () => {
      await store.createMemory({
        subject: 'Older',
        keywords: ['old'],
        applies_to: 'global' as const,
        content: 'Older memory content.',
        occurred_at: '2024-01-01T00:00:00.000Z',
      });
      await store.createMemory({
        subject: 'Newer',
        keywords: ['new'],
        applies_to: 'global' as const,
        content: 'Newer memory content.',
        occurred_at: '2024-01-02T00:00:00.000Z',
      });

      const memories = await store.listMemories();
      expect(memories[0].subject).toBe('Newer');
      expect(memories[1].subject).toBe('Older');
    });

    it('should apply pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await store.createMemory({
          subject: `Memory ${i}`,
          keywords: ['paginated'],
          applies_to: 'global' as const,
          content: `Memory ${i} content for pagination test.`,
          occurred_at: new Date(2024, 0, i + 1).toISOString(),
        });
      }

      const page = await store.listMemories({ limit: 2, offset: 1 });
      expect(page).toHaveLength(2);
    });
  });

  describe('embeddings', () => {
    it('should store and retrieve embedding', async () => {
      const created = await store.createMemory({
        subject: 'Embedding test',
        keywords: ['embed'],
        applies_to: 'global' as const,
        content: 'Memory for embedding testing.',
      });

      const embedding = Array(768).fill(0.1);
      await store.storeEmbedding(created.id, embedding);

      const retrieved = await store.getEmbedding(created.id);
      expect(retrieved).toEqual(embedding);
    });

    it('should append embedding entry to JSONL', async () => {
      const created = await store.createMemory({
        subject: 'Embedding test',
        keywords: ['embed'],
        applies_to: 'global' as const,
        content: 'Memory for embedding testing.',
      });

      await store.storeEmbedding(created.id, Array(768).fill(0.1));

      const filePath = path.join(testDir, 'episodic.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[1]).action).toBe('embedding');
    });

    it('should return null for memory without embedding', async () => {
      const created = await store.createMemory({
        subject: 'No embedding',
        keywords: ['none'],
        applies_to: 'global' as const,
        content: 'Memory without embedding.',
      });

      const embedding = await store.getEmbedding(created.id);
      expect(embedding).toBeNull();
    });

    it('should list memories needing embeddings', async () => {
      const withEmbedding = await store.createMemory({
        subject: 'With embedding',
        keywords: ['with'],
        applies_to: 'global' as const,
        content: 'Memory with embedding.',
      });
      await store.storeEmbedding(withEmbedding.id, Array(768).fill(0.1));

      await store.createMemory({
        subject: 'Without embedding',
        keywords: ['without'],
        applies_to: 'global' as const,
        content: 'Memory without embedding.',
      });

      const needingEmbeddings = await store.getMemoriesNeedingEmbeddings();
      expect(needingEmbeddings).toHaveLength(1);
      expect(needingEmbeddings[0].subject).toBe('Without embedding');
    });
  });

  describe('compaction', () => {
    it('should compact file to current state', async () => {
      // Create, delete, and create again
      const first = await store.createMemory({
        subject: 'To delete',
        keywords: ['delete'],
        applies_to: 'global' as const,
        content: 'This will be deleted.',
      });
      await store.createMemory({
        subject: 'To keep',
        keywords: ['keep'],
        applies_to: 'global' as const,
        content: 'This will be kept.',
      });
      await store.deleteMemory(first.id);

      // Before compact: 3 entries (add, add, delete)
      let filePath = path.join(testDir, 'episodic.jsonl');
      let content = await fs.readFile(filePath, 'utf-8');
      let lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(3);

      // Compact
      const result = await store.compact();

      // After compact: 1 entry (only the kept memory)
      content = await fs.readFile(filePath, 'utf-8');
      lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0]).subject).toBe('To keep');
      expect(result.originalLines).toBe(3);
      expect(result.newLines).toBe(1);
    });

    it('should include embeddings in compacted file', async () => {
      const created = await store.createMemory({
        subject: 'With embedding',
        keywords: ['embed'],
        applies_to: 'global' as const,
        content: 'Memory with embedding for compaction test.',
      });
      await store.storeEmbedding(created.id, Array(768).fill(0.5));

      const result = await store.compact();

      const filePath = path.join(testDir, 'episodic.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(2); // add + embedding
      expect(JSON.parse(lines[0]).action).toBe('add');
      expect(JSON.parse(lines[1]).action).toBe('embedding');
      expect(result.newLines).toBe(2);
    });
  });

  describe('persistence across instances', () => {
    it('should reload state from JSONL file', async () => {
      // Create memory with first store instance
      const created = await store.createMemory({
        subject: 'Persistent',
        keywords: ['persist'],
        applies_to: 'global' as const,
        content: 'Memory that should persist across instances.',
      });
      await store.storeEmbedding(created.id, Array(768).fill(0.3));

      // Create new store instance
      const newStore = new EpisodicJsonlStore({ baseDir: testDir });
      await newStore.initialize();

      // Should load the memory
      const retrieved = await newStore.getMemory(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.subject).toBe('Persistent');

      // Should load the embedding
      const embedding = await newStore.getEmbedding(created.id);
      expect(embedding).toEqual(Array(768).fill(0.3));
    });
  });
});
