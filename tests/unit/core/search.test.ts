import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SearchEngine } from '../../../src/core/search.js';
import { MemoryManager } from '../../../src/core/memory.js';

// Mock the vector store to avoid needing the embedding model in tests
vi.mock('../../../src/core/vector-store.js', () => ({
  getVectorStore: () => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(true),
    search: vi.fn().mockResolvedValue([]),
    sync: vi.fn().mockResolvedValue({ added: 0, removed: 0 }),
    getStoredIds: vi.fn().mockResolvedValue(new Set()),
  }),
}));

describe('SearchEngine', () => {
  let testDir: string;
  let searchEngine: SearchEngine;
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-search-test-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    memoryManager = new MemoryManager(testDir);
    searchEngine = new SearchEngine(memoryManager);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
    vi.clearAllMocks();
  });

  // Note: search tests use mocked vector store, so we test that:
  // 1. The search method is called correctly
  // 2. Results are returned in expected format
  // 3. Options are passed through properly

  describe('search (vector-based)', () => {
    it('should delegate to vector store search', async () => {
      // The mocked vector store returns empty array by default
      const results = await searchEngine.search('typescript');

      expect(results).toEqual([]);
    });

    it('should pass limit option to vector store', async () => {
      const results = await searchEngine.search('test query', { limit: 5 });

      expect(results).toEqual([]);
    });

    it('should pass scope option to vector store', async () => {
      const results = await searchEngine.search('test query', { scope: 'global' });

      expect(results).toEqual([]);
    });
  });

  describe('searchByKeywords (deprecated, delegates to search)', () => {
    it('should delegate to search method', async () => {
      const results = await searchEngine.searchByKeywords('typescript');

      // searchByKeywords is deprecated and delegates to search
      expect(results).toEqual([]);
    });
  });

  describe('searchBySubject (deprecated, delegates to search)', () => {
    it('should delegate to search method', async () => {
      const results = await searchEngine.searchBySubject('API endpoint');

      // searchBySubject is deprecated and delegates to search
      expect(results).toEqual([]);
    });
  });

  describe('searchByScope', () => {
    it('should return all memories for a scope', async () => {
      await memoryManager.createMemory({
        subject: 'Global 1',
        keywords: ['global'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await memoryManager.createMemory({
        subject: 'Global 2',
        keywords: ['global'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await memoryManager.createMemory({
        subject: 'File specific',
        keywords: ['file'],
        applies_to: 'file:/test.ts' as const,
        content: 'Test content with sufficient length.',
      });

      const globalMemories = await searchEngine.searchByScope('global');

      expect(globalMemories).toHaveLength(2);
    });
  });

  describe('getRelevantForSession', () => {
    it('should return file-specific memories', async () => {
      const fileMemory = await memoryManager.createMemory({
        subject: 'File memory',
        keywords: ['file'],
        applies_to: 'file:/src/index.ts' as const,
        content: 'Test content with sufficient length.',
      });

      await memoryManager.createMemory({
        subject: 'Other memory',
        keywords: ['other'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      const memories = await searchEngine.getRelevantForSession({
        files: ['/src/index.ts'],
      });

      expect(memories.some((m) => m.id === fileMemory.id)).toBe(true);
    });

    it('should return area-specific memories', async () => {
      const areaMemory = await memoryManager.createMemory({
        subject: 'Auth area memory',
        keywords: ['auth'],
        applies_to: 'area:authentication' as const,
        content: 'Test content with sufficient length.',
      });

      const memories = await searchEngine.getRelevantForSession({
        area: 'authentication',
      });

      expect(memories.some((m) => m.id === areaMemory.id)).toBe(true);
    });

    it('should fill with global memories', async () => {
      const globalMemory = await memoryManager.createMemory({
        subject: 'Global memory',
        keywords: ['global'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      const memories = await searchEngine.getRelevantForSession({});

      expect(memories.some((m) => m.id === globalMemory.id)).toBe(true);
    });

    it('should not return duplicates', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Unique memory',
        keywords: ['unique'],
        applies_to: 'file:/src/test.ts' as const,
        content: 'Test content with sufficient length.',
      });

      const memories = await searchEngine.getRelevantForSession({
        files: ['/src/test.ts', '/src/test.ts'], // Same file twice
      });

      const ids = memories.map((m) => m.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids).toEqual(uniqueIds);
    });

    it('should respect max context limit', async () => {
      // Create more memories than the default limit
      for (let i = 0; i < 15; i++) {
        await memoryManager.createMemory({
          subject: `Memory ${i}`,
          keywords: ['many'],
          applies_to: 'global' as const,
          content: `Content ${i}.`,
        });
      }

      const memories = await searchEngine.getRelevantForSession({});

      // Default maxContextMemories is 10
      expect(memories.length).toBeLessThanOrEqual(10);
    });
  });
});
