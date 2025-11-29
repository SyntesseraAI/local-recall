import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SearchEngine } from '../../../src/core/search.js';
import { IndexManager } from '../../../src/core/index.js';
import { MemoryManager } from '../../../src/core/memory.js';

describe('SearchEngine', () => {
  let testDir: string;
  let searchEngine: SearchEngine;
  let indexManager: IndexManager;
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-search-test-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    indexManager = new IndexManager(testDir);
    memoryManager = new MemoryManager(testDir);
    searchEngine = new SearchEngine(indexManager, memoryManager);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('searchByKeywords', () => {
    it('should find exact keyword matches', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'TypeScript testing',
        keywords: ['typescript', 'testing', 'vitest'],
        applies_to: 'global' as const,
        content: 'Testing TypeScript with Vitest.',
      });

      await indexManager.buildIndex();

      const results = await searchEngine.searchByKeywords('typescript');

      expect(results).toHaveLength(1);
      expect(results[0]?.memory.id).toBe(memory.id);
      expect(results[0]?.matchedKeywords).toContain('typescript');
    });

    it('should find fuzzy keyword matches', async () => {
      await memoryManager.createMemory({
        subject: 'JavaScript guide',
        keywords: ['javascript', 'programming'],
        applies_to: 'global' as const,
        content: 'Guide to JavaScript.',
      });

      await indexManager.buildIndex();

      // "javascrpt" should fuzzy match "javascript"
      const results = await searchEngine.searchByKeywords('javascrpt');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should rank results by relevance', async () => {
      await memoryManager.createMemory({
        subject: 'React components',
        keywords: ['react', 'components'],
        applies_to: 'global' as const,
        content: 'Building React components.',
      });

      await memoryManager.createMemory({
        subject: 'React and Vue comparison',
        keywords: ['react', 'vue', 'comparison'],
        applies_to: 'global' as const,
        content: 'Comparing React and Vue.',
      });

      await indexManager.buildIndex();

      const results = await searchEngine.searchByKeywords('react components');

      // The memory with both keywords should rank higher
      expect(results).toHaveLength(2);
      expect(results[0]?.memory.subject).toBe('React components');
    });

    it('should filter by scope', async () => {
      await memoryManager.createMemory({
        subject: 'Global auth memory',
        keywords: ['authentication'],
        applies_to: 'global' as const,
        content: 'Global auth.',
      });

      await memoryManager.createMemory({
        subject: 'File-specific auth memory',
        keywords: ['authentication'],
        applies_to: 'file:/src/auth.ts' as const,
        content: 'File-specific auth.',
      });

      await indexManager.buildIndex();

      const globalResults = await searchEngine.searchByKeywords('authentication', {
        scope: 'global',
      });

      const fileResults = await searchEngine.searchByKeywords('authentication', {
        scope: 'file:/src/auth.ts',
      });

      expect(globalResults).toHaveLength(1);
      expect(globalResults[0]?.memory.subject).toBe('Global auth memory');
      expect(fileResults).toHaveLength(1);
      expect(fileResults[0]?.memory.subject).toBe('File-specific auth memory');
    });

    it('should limit results', async () => {
      for (let i = 0; i < 5; i++) {
        await memoryManager.createMemory({
          subject: `Memory ${i}`,
          keywords: ['common'],
          applies_to: 'global' as const,
          content: `Content ${i}.`,
        });
      }

      await indexManager.buildIndex();

      const results = await searchEngine.searchByKeywords('common', { limit: 3 });

      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', async () => {
      await memoryManager.createMemory({
        subject: 'Unrelated memory',
        keywords: ['unrelated'],
        applies_to: 'global' as const,
        content: 'Test content with sufficient length.',
      });

      await indexManager.buildIndex();

      const results = await searchEngine.searchByKeywords('nonexistent');

      expect(results).toEqual([]);
    });

    it('should handle multi-word queries', async () => {
      await memoryManager.createMemory({
        subject: 'Database optimization',
        keywords: ['database', 'optimization', 'performance'],
        applies_to: 'global' as const,
        content: 'Database optimization tips.',
      });

      await indexManager.buildIndex();

      const results = await searchEngine.searchByKeywords('database optimization');

      expect(results).toHaveLength(1);
      expect(results[0]?.matchedKeywords).toContain('database');
      expect(results[0]?.matchedKeywords).toContain('optimization');
    });
  });

  describe('searchBySubject', () => {
    it('should find memories by subject', async () => {
      const memory = await memoryManager.createMemory({
        subject: 'API endpoint documentation',
        keywords: ['api'],
        applies_to: 'global' as const,
        content: 'API documentation content.',
      });

      const results = await searchEngine.searchBySubject('API endpoint');

      expect(results).toHaveLength(1);
      expect(results[0]?.memory.id).toBe(memory.id);
    });

    it('should support fuzzy subject matching', async () => {
      await memoryManager.createMemory({
        subject: 'Authentication flow',
        keywords: ['auth'],
        applies_to: 'global' as const,
        content: 'Auth flow.',
      });

      const results = await searchEngine.searchBySubject('Authentcation'); // typo

      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by scope', async () => {
      await memoryManager.createMemory({
        subject: 'Config setup',
        keywords: ['config'],
        applies_to: 'global' as const,
        content: 'Global config.',
      });

      await memoryManager.createMemory({
        subject: 'Config setup for tests',
        keywords: ['config'],
        applies_to: 'area:testing' as const,
        content: 'Test config.',
      });

      const results = await searchEngine.searchBySubject('Config', {
        scope: 'area:testing',
      });

      expect(results).toHaveLength(1);
      expect(results[0]?.memory.applies_to).toBe('area:testing');
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
