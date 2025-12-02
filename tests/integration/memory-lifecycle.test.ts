import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { MemoryManager } from '../../src/core/memory.js';
import { SearchEngine } from '../../src/core/search.js';
import { getVectorStore, resetVectorStore } from '../../src/core/vector-store.js';

describe('Memory Lifecycle Integration', () => {
  let testDir: string;
  let memoryManager: MemoryManager;
  let searchEngine: SearchEngine;

  beforeEach(async () => {
    // Reset singleton before each test to ensure clean state
    resetVectorStore();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-integration-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    memoryManager = new MemoryManager(testDir);
    searchEngine = new SearchEngine(memoryManager);
  });

  afterEach(async () => {
    // Reset singleton and cleanup
    resetVectorStore();
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('Full CRD cycle', () => {
    it('should create, read, and delete a memory', async () => {
      // Create
      const created = await memoryManager.createMemory({
        subject: 'Integration test memory',
        keywords: ['integration', 'test', 'crud'],
        applies_to: 'global' as const,
        content: 'This is the original content.',
      });

      expect(created.id).toBeDefined();
      expect(created.occurred_at).toBeDefined();

      // Read
      const read = await memoryManager.getMemory(created.id);
      expect(read).not.toBeNull();
      expect(read?.subject).toBe('Integration test memory');

      // Delete
      const deleted = await memoryManager.deleteMemory(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const readAfterDelete = await memoryManager.getMemory(created.id);
      expect(readAfterDelete).toBeNull();
    });
  });

  describe('Vector Search integration', () => {
    it('should make new memories searchable via vector search', async () => {
      // Create memory - automatically added to vector store
      const memory = await memoryManager.createMemory({
        subject: 'Database optimization techniques',
        keywords: ['database', 'optimization', 'performance', 'sql'],
        applies_to: 'global' as const,
        content: 'Various techniques for optimizing database queries.',
      });

      // Search should find it via semantic similarity
      const results = await searchEngine.search('database optimization');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.memory.id).toBe(memory.id);
    });

    it('should handle delete and recreate pattern (idempotent memories)', async () => {
      // Create initial memory
      const memory = await memoryManager.createMemory({
        subject: 'Initial subject',
        keywords: ['initial', 'original'],
        applies_to: 'global' as const,
        content: 'Original content about initial setup.',
      });

      // Verify initial search works
      const initialResults = await searchEngine.search('initial setup');
      expect(initialResults.some((r) => r.memory.id === memory.id)).toBe(true);

      // Delete and recreate with new keywords (idempotent pattern)
      await memoryManager.deleteMemory(memory.id);
      const newMemory = await memoryManager.createMemory({
        subject: 'Updated subject',
        keywords: ['updated', 'new', 'keywords'],
        applies_to: 'global' as const,
        content: 'Updated content with new information.',
      });

      // Old memory should not be found
      const oldResults = await searchEngine.search('initial setup');
      const foundWithOld = oldResults.some((r) => r.memory.id === memory.id);
      expect(foundWithOld).toBe(false);

      // New memory should be found
      const newResults = await searchEngine.search('updated information');
      const foundWithNew = newResults.some((r) => r.memory.id === newMemory.id);
      expect(foundWithNew).toBe(true);
    });

    it('should remove deleted memories from search', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'To be deleted',
        keywords: ['deletable'],
        applies_to: 'global' as const,
        content: 'This content will be deleted soon.',
      });

      // Verify searchable
      const beforeDelete = await searchEngine.search('content deleted');
      expect(beforeDelete.some((r) => r.memory.id === memory.id)).toBe(true);

      // Delete memory - automatically removed from vector store
      await memoryManager.deleteMemory(memory.id);

      // Verify not searchable
      const afterDelete = await searchEngine.search('content deleted');
      expect(afterDelete.some((r) => r.memory.id === memory.id)).toBe(false);
    });
  });

  describe('Scope-based organization', () => {
    it('should organize and retrieve memories by scope', async () => {
      // Create memories with different scopes
      const globalMemory = await memoryManager.createMemory({
        subject: 'Global configuration',
        keywords: ['config'],
        applies_to: 'global' as const,
        content: 'Global config info.',
      });

      const fileMemory = await memoryManager.createMemory({
        subject: 'File-specific notes',
        keywords: ['config'],
        applies_to: 'file:/src/config.ts' as const,
        content: 'Config file notes.',
      });

      const areaMemory = await memoryManager.createMemory({
        subject: 'Authentication area',
        keywords: ['config'],
        applies_to: 'area:authentication' as const,
        content: 'Auth config.',
      });

      // Search with scope filter
      const globalResults = await searchEngine.search('config', {
        scope: 'global',
      });
      const fileResults = await searchEngine.search('config', {
        scope: 'file:/src/config.ts',
      });
      const areaResults = await searchEngine.search('config', {
        scope: 'area:authentication',
      });

      expect(globalResults).toHaveLength(1);
      expect(globalResults[0]?.memory.id).toBe(globalMemory.id);

      expect(fileResults).toHaveLength(1);
      expect(fileResults[0]?.memory.id).toBe(fileMemory.id);

      expect(areaResults).toHaveLength(1);
      expect(areaResults[0]?.memory.id).toBe(areaMemory.id);
    });

    it('should retrieve session-relevant memories by context', async () => {
      // Create various memories
      await memoryManager.createMemory({
        subject: 'Global best practices',
        keywords: ['best-practices'],
        applies_to: 'global' as const,
        content: 'Global practices.',
      });

      const fileMemory = await memoryManager.createMemory({
        subject: 'API handler notes',
        keywords: ['api'],
        applies_to: 'file:/src/api/handler.ts' as const,
        content: 'API notes and documentation.',
      });

      const areaMemory = await memoryManager.createMemory({
        subject: 'API area knowledge',
        keywords: ['api'],
        applies_to: 'area:api' as const,
        content: 'API area knowledge and info.',
      });

      // Get relevant for session
      const sessionMemories = await searchEngine.getRelevantForSession({
        files: ['/src/api/handler.ts'],
        area: 'api',
      });

      // Should include file and area specific memories
      expect(sessionMemories.some((m) => m.id === fileMemory.id)).toBe(true);
      expect(sessionMemories.some((m) => m.id === areaMemory.id)).toBe(true);
    });
  });

  describe('Concurrent operations', () => {
    it('should handle concurrent memory creation', async () => {
      const createPromises = [];

      for (let i = 0; i < 10; i++) {
        createPromises.push(
          memoryManager.createMemory({
            subject: `Concurrent memory ${i}`,
            keywords: ['concurrent', `memory${i}`],
            applies_to: 'global' as const,
            content: `Content for memory ${i}.`,
          })
        );
      }

      const memories = await Promise.all(createPromises);

      expect(memories).toHaveLength(10);

      // All should have unique IDs
      const ids = memories.map((m) => m.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);

      // All should be readable
      for (const memory of memories) {
        const read = await memoryManager.getMemory(memory.id);
        expect(read).not.toBeNull();
      }
    });

    it('should handle vector store sync while creating memories', async () => {
      // Start creating memories
      const createPromises = [];
      for (let i = 0; i < 5; i++) {
        createPromises.push(
          memoryManager.createMemory({
            subject: `Sync test ${i}`,
            keywords: ['synctest'],
            applies_to: 'global' as const,
            content: `Content ${i}.`,
          })
        );
      }

      await Promise.all(createPromises);

      // All memories should be searchable
      const results = await searchEngine.search('sync test');
      expect(results.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Data persistence', () => {
    it('should persist data across manager instances', async () => {
      // Create memory with first manager
      const created = await memoryManager.createMemory({
        subject: 'Persistent memory',
        keywords: ['persistent'],
        applies_to: 'global' as const,
        content: 'This should persist.',
      });

      // Create new managers
      const newMemoryManager = new MemoryManager(testDir);
      const newSearchEngine = new SearchEngine(newMemoryManager);

      // Read memory with new manager
      const read = await newMemoryManager.getMemory(created.id);
      expect(read).not.toBeNull();
      expect(read?.subject).toBe('Persistent memory');

      // Search with new engine
      const results = await newSearchEngine.search('persistent');
      expect(results.some((r) => r.memory.id === created.id)).toBe(true);
    });

    it('should recover from missing vector store by rebuilding', async () => {
      // Create some memories
      const memory = await memoryManager.createMemory({
        subject: 'Memory for recovery',
        keywords: ['recovery'],
        applies_to: 'global' as const,
        content: 'Test content for recovery test.',
      });

      // Close vector store
      const vectorStore = getVectorStore(testDir);
      vectorStore.close();

      // Delete the sqlite file
      const dbPath = path.join(testDir, 'memory.sqlite');
      try {
        await fs.unlink(dbPath);
      } catch {
        // File may not exist
      }

      // Sync should rebuild
      const allMemories = await memoryManager.listMemories();
      const newVectorStore = getVectorStore(testDir);
      await newVectorStore.initialize();
      await newVectorStore.sync(allMemories);

      // Should be searchable again
      const newSearchEngine = new SearchEngine(memoryManager);
      const results = await newSearchEngine.search('recovery');
      expect(results.some((r) => r.memory.id === memory.id)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle memories with special characters in content', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Special chars test',
        keywords: ['special'],
        applies_to: 'global' as const,
        content: 'Code: `const x = "test";\nif (x > 0) { return true; }`\n\n---\n\n**Bold** and *italic*',
      });

      const read = await memoryManager.getMemory(memory.id);
      expect(read?.content).toContain('const x = "test"');
      expect(read?.content).toContain('**Bold**');
    });

    it('should handle memories with unicode content', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Unicode test',
        keywords: ['unicode', 'emoji'],
        applies_to: 'global' as const,
        content: 'This has unicode: 日本語, emoji: 🎉, and math: ∑∏∫',
      });

      const read = await memoryManager.getMemory(memory.id);
      expect(read?.content).toContain('日本語');
      expect(read?.content).toContain('🎉');
    });

    it('should handle very long content', async () => {
      const longContent = 'x'.repeat(10000);

      const memory = await memoryManager.createMemory({
        subject: 'Long content test',
        keywords: ['long'],
        applies_to: 'global' as const,
        content: longContent,
      });

      const read = await memoryManager.getMemory(memory.id);
      expect(read?.content.length).toBe(10000);
    });

    it('should handle many keywords', async () => {
      const keywords = Array.from({ length: 20 }, (_, i) => `keyword${i}`);

      const memory = await memoryManager.createMemory({
        subject: 'Many keywords test',
        keywords,
        applies_to: 'global' as const,
        content: 'Testing many keywords in this document.',
      });

      // Should be findable by semantic search
      const results = await searchEngine.search('many keywords test');
      expect(results.some((r) => r.memory.id === memory.id)).toBe(true);
    });
  });
});
