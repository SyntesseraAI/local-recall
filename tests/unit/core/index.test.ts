import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { IndexManager } from '../../../src/core/index.js';
import { MemoryManager } from '../../../src/core/memory.js';

describe('IndexManager', () => {
  let testDir: string;
  let indexManager: IndexManager;
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-index-test-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    indexManager = new IndexManager(testDir);
    memoryManager = new MemoryManager(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('buildIndex', () => {
    it('should build empty index when no memories exist', async () => {
      const index = await indexManager.buildIndex();

      expect(index.version).toBe(1);
      expect(index.built_at).toBeDefined();
      expect(Object.keys(index.memories)).toHaveLength(0);
      expect(Object.keys(index.keywords)).toHaveLength(0);
    });

    it('should index memory keywords', async () => {
      await memoryManager.createMemory({
        subject: 'Test memory',
        keywords: ['javascript', 'testing', 'vitest'],
        applies_to: 'global' as const,
        content: 'Test content.',
      });

      const index = await indexManager.buildIndex();

      expect(Object.keys(index.keywords)).toContain('javascript');
      expect(Object.keys(index.keywords)).toContain('testing');
      expect(Object.keys(index.keywords)).toContain('vitest');
    });

    it('should map keywords to memory IDs', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Indexed memory',
        keywords: ['indexkey'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      const index = await indexManager.buildIndex();

      expect(index.keywords['indexkey']).toContain(memory.id);
      expect(index.memories[memory.id]).toBeDefined();
      expect(index.memories[memory.id]?.subject).toBe('Indexed memory');
    });

    it('should handle multiple memories with same keyword', async () => {
      const memory1 = await memoryManager.createMemory({
        subject: 'Memory 1',
        keywords: ['shared'],
        applies_to: 'global' as const,
        content: 'First test content here.',
      });

      const memory2 = await memoryManager.createMemory({
        subject: 'Memory 2',
        keywords: ['shared'],
        applies_to: 'global' as const,
        content: 'Second test content here.',
      });

      const index = await indexManager.buildIndex();

      expect(index.keywords['shared']).toContain(memory1.id);
      expect(index.keywords['shared']).toContain(memory2.id);
      expect(index.keywords['shared']).toHaveLength(2);
    });

    it('should persist index to disk', async () => {
      await memoryManager.createMemory({
        subject: 'Persisted memory',
        keywords: ['persisted'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const indexPath = path.join(testDir, 'index.json');
      const exists = await fs.access(indexPath).then(() => true).catch(() => false);

      expect(exists).toBe(true);

      const content = await fs.readFile(indexPath, 'utf-8');
      const savedIndex = JSON.parse(content);

      expect(savedIndex.version).toBe(1);
      expect(Object.keys(savedIndex.keywords)).toContain('persisted');
    });
  });

  describe('getIndex', () => {
    it('should return cached index when fresh', async () => {
      await memoryManager.createMemory({
        subject: 'Cached memory',
        keywords: ['cached'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      // Build index first
      await indexManager.buildIndex();

      // Get index (should use cache)
      const index = await indexManager.getIndex();

      expect(Object.keys(index.keywords)).toContain('cached');
    });

    it('should build index if none exists', async () => {
      const index = await indexManager.getIndex();

      expect(index.version).toBe(1);
      expect(index.built_at).toBeDefined();
    });

    it('should load index from disk', async () => {
      await memoryManager.createMemory({
        subject: 'Disk memory',
        keywords: ['fromDisk'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      // Create a new IndexManager instance (no cache)
      const newIndexManager = new IndexManager(testDir);
      const index = await newIndexManager.getIndex();

      expect(Object.keys(index.keywords)).toContain('fromdisk'); // lowercased
    });
  });

  describe('refreshIndex', () => {
    it('should rebuild the index', async () => {
      await memoryManager.createMemory({
        subject: 'Initial memory',
        keywords: ['initial'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      await memoryManager.createMemory({
        subject: 'New memory',
        keywords: ['newmemory'],
        applies_to: 'global' as const,
        content: 'New content.',
      });

      const refreshedIndex = await indexManager.refreshIndex();

      expect(Object.keys(refreshedIndex.keywords)).toContain('initial');
      expect(Object.keys(refreshedIndex.keywords)).toContain('newmemory');
    });
  });

  describe('getMemoryIdsByKeyword', () => {
    it('should return memory IDs for a keyword', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Keyword lookup test',
        keywords: ['lookupkey'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const ids = await indexManager.getMemoryIdsByKeyword('lookupkey');

      expect(ids).toContain(memory.id);
    });

    it('should return empty array for non-existent keyword', async () => {
      await indexManager.buildIndex();

      const ids = await indexManager.getMemoryIdsByKeyword('nonexistent');

      expect(ids).toEqual([]);
    });

    it('should be case-insensitive', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Case test',
        keywords: ['CamelCase'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const ids = await indexManager.getMemoryIdsByKeyword('camelcase');

      expect(ids).toContain(memory.id);
    });
  });

  describe('getAllKeywords', () => {
    it('should return all unique keywords', async () => {
      await memoryManager.createMemory({
        subject: 'Memory 1',
        keywords: ['alpha', 'beta'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await memoryManager.createMemory({
        subject: 'Memory 2',
        keywords: ['beta', 'gamma'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const keywords = await indexManager.getAllKeywords();

      expect(keywords).toContain('alpha');
      expect(keywords).toContain('beta');
      expect(keywords).toContain('gamma');
      // No duplicates
      const uniqueKeywords = [...new Set(keywords)];
      expect(keywords).toEqual(uniqueKeywords);
    });
  });

  describe('getMemoryEntry', () => {
    it('should return memory entry by ID', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'Entry test',
        keywords: ['entry'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const entry = await indexManager.getMemoryEntry(memory.id);

      expect(entry).not.toBeNull();
      expect(entry?.id).toBe(memory.id);
      expect(entry?.subject).toBe('Entry test');
      expect(entry?.keywords).toContain('entry');
    });

    it('should return null for non-existent memory', async () => {
      await indexManager.buildIndex();

      const entry = await indexManager.getMemoryEntry('non-existent-id');

      expect(entry).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await memoryManager.createMemory({
        subject: 'Stats memory 1',
        keywords: ['stat1', 'common'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await memoryManager.createMemory({
        subject: 'Stats memory 2',
        keywords: ['stat2', 'common'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const stats = await indexManager.getStats();

      expect(stats.memoriesIndexed).toBe(2);
      expect(stats.keywordsIndexed).toBe(3); // stat1, stat2, common
      expect(stats.builtAt).toBeDefined();
    });
  });
});
