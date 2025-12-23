import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { EpisodicJsonlStore } from '../../../src/core/episodic-jsonl-store.js';

describe('EpisodicJsonlStore', () => {
  let testDir: string;
  let storeDir: string; // episodic-memory subdirectory where JSONL files are stored
  let store: EpisodicJsonlStore;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-test-'));
    storeDir = path.join(testDir, 'episodic-memory');
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

      // Check file exists and contains the memory (multi-file format in subdirectory)
      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
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

      // Should only have one entry in the file (multi-file format in subdirectory)
      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
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

      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
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

      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
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
      let filePath = path.join(storeDir, 'episodic-000001.jsonl');
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

      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
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

  describe('multi-file scenarios', () => {
    it('should append to the last file when multiple files exist', async () => {
      // Pre-create multiple JSONL files to simulate existing multi-file state
      // File 1 with 2 entries
      const file1Content = [
        JSON.stringify({
          action: 'add',
          id: 'memory-1',
          subject: 'Memory 1',
          keywords: ['test'],
          applies_to: 'global',
          occurred_at: '2024-01-01T00:00:00.000Z',
          content_hash: 'hash1',
          content: 'Content for memory 1.',
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
        JSON.stringify({
          action: 'add',
          id: 'memory-2',
          subject: 'Memory 2',
          keywords: ['test'],
          applies_to: 'global',
          occurred_at: '2024-01-01T00:01:00.000Z',
          content_hash: 'hash2',
          content: 'Content for memory 2.',
          timestamp: '2024-01-01T00:01:00.000Z',
        }),
      ].join('\n') + '\n';

      // File 3 (skipping 2) with 1 entry - tests that we find the highest numbered file
      const file3Content = [
        JSON.stringify({
          action: 'add',
          id: 'memory-3',
          subject: 'Memory 3',
          keywords: ['test'],
          applies_to: 'global',
          occurred_at: '2024-01-01T00:02:00.000Z',
          content_hash: 'hash3',
          content: 'Content for memory 3.',
          timestamp: '2024-01-01T00:02:00.000Z',
        }),
      ].join('\n') + '\n';

      // Create the directory and files
      await fs.mkdir(storeDir, { recursive: true });
      await fs.writeFile(path.join(storeDir, 'episodic-000001.jsonl'), file1Content);
      await fs.writeFile(path.join(storeDir, 'episodic-000003.jsonl'), file3Content);

      // Create a new store and add a memory
      const newStore = new EpisodicJsonlStore({ baseDir: testDir });
      const newMemory = await newStore.createMemory({
        subject: 'New Memory',
        keywords: ['new'],
        applies_to: 'global' as const,
        content: 'This should be appended to file 3, not file 1.',
      });

      // Verify the new memory was appended to file 3
      const file3Updated = await fs.readFile(path.join(storeDir, 'episodic-000003.jsonl'), 'utf-8');
      const file3Lines = file3Updated.split('\n').filter((l) => l.trim());
      expect(file3Lines).toHaveLength(2); // Original + new

      const lastEntry = JSON.parse(file3Lines[1]);
      expect(lastEntry.id).toBe(newMemory.id);
      expect(lastEntry.subject).toBe('New Memory');

      // File 1 should be unchanged
      const file1After = await fs.readFile(path.join(storeDir, 'episodic-000001.jsonl'), 'utf-8');
      const file1Lines = file1After.split('\n').filter((l) => l.trim());
      expect(file1Lines).toHaveLength(2); // Unchanged
    });

    it('should handle concurrent appends without race conditions', async () => {
      // Create a fresh store
      const store1 = new EpisodicJsonlStore({ baseDir: testDir });

      // Launch multiple concurrent creates - this tests the loadPromise synchronization
      const promises = Array.from({ length: 10 }, (_, i) =>
        store1.createMemory({
          subject: `Concurrent Memory ${i}`,
          keywords: ['concurrent'],
          applies_to: 'global' as const,
          content: `Content for concurrent memory ${i}.`,
          occurred_at: `2024-01-01T00:0${i}:00.000Z`,
        })
      );

      const results = await Promise.all(promises);

      // All 10 should be created successfully
      expect(results).toHaveLength(10);
      expect(new Set(results.map((m) => m.id)).size).toBe(10); // All unique IDs

      // All should be in the same file (file 1) since they fit
      const filePath = path.join(storeDir, 'episodic-000001.jsonl');
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(10);
    });
  });
});
