import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ProcessedLogManager } from '../../../src/core/processed-log.js';

describe('ProcessedLogManager', () => {
  let testDir: string;
  let processedLog: ProcessedLogManager;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-test-'));
    process.env['LOCAL_RECALL_DIR'] = testDir;
    processedLog = new ProcessedLogManager(testDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('load', () => {
    it('should return empty log when file does not exist', async () => {
      const log = await processedLog.load();

      expect(log.version).toBe(1);
      expect(log.transcripts).toEqual({});
      expect(log.lastUpdated).toBeDefined();
    });

    it('should load existing JSONL log from disk', async () => {
      // Create a JSONL log file
      const entries = [
        {
          action: 'add',
          filename: 'test.jsonl',
          sourcePath: '/source/test.jsonl',
          contentHash: 'abc123',
          lastModified: '2024-01-01T00:00:00.000Z',
          processedAt: '2024-01-01T00:00:00.000Z',
          memoriesCreated: ['id1', 'id2'],
        },
      ];
      const content = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
      await fs.writeFile(path.join(testDir, 'processed-log.jsonl'), content, 'utf-8');

      const log = await processedLog.load();

      expect(log.transcripts['test.jsonl']).toBeDefined();
      expect(log.transcripts['test.jsonl'].contentHash).toBe('abc123');
      expect(log.transcripts['test.jsonl'].memoriesCreated).toEqual(['id1', 'id2']);
    });

    it('should replay add and remove entries correctly', async () => {
      const entries = [
        {
          action: 'add',
          filename: 'first.jsonl',
          sourcePath: '/source/first.jsonl',
          contentHash: 'hash1',
          lastModified: '2024-01-01T00:00:00.000Z',
          processedAt: '2024-01-01T00:00:00.000Z',
          memoriesCreated: ['id1'],
        },
        {
          action: 'add',
          filename: 'second.jsonl',
          sourcePath: '/source/second.jsonl',
          contentHash: 'hash2',
          lastModified: '2024-01-01T00:00:00.000Z',
          processedAt: '2024-01-01T00:00:00.000Z',
          memoriesCreated: ['id2'],
        },
        {
          action: 'remove',
          filename: 'first.jsonl',
          removedAt: '2024-01-01T01:00:00.000Z',
        },
      ];
      const content = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
      await fs.writeFile(path.join(testDir, 'processed-log.jsonl'), content, 'utf-8');

      const log = await processedLog.load();

      expect(log.transcripts['first.jsonl']).toBeUndefined();
      expect(log.transcripts['second.jsonl']).toBeDefined();
      expect(log.transcripts['second.jsonl'].contentHash).toBe('hash2');
    });

    it('should skip invalid lines gracefully', async () => {
      const content = [
        JSON.stringify({
          action: 'add',
          filename: 'valid.jsonl',
          sourcePath: '/source/valid.jsonl',
          contentHash: 'hash',
          lastModified: '2024-01-01T00:00:00.000Z',
          processedAt: '2024-01-01T00:00:00.000Z',
          memoriesCreated: [],
        }),
        'invalid json line',
        '{"action": "unknown"}',
      ].join('\n');
      await fs.writeFile(path.join(testDir, 'processed-log.jsonl'), content, 'utf-8');

      const log = await processedLog.load();

      expect(log.transcripts['valid.jsonl']).toBeDefined();
      expect(Object.keys(log.transcripts)).toHaveLength(1);
    });
  });

  describe('needsProcessing', () => {
    it('should return true for new transcript', async () => {
      const needs = await processedLog.needsProcessing('new.jsonl', 'hash123');
      expect(needs).toBe(true);
    });

    it('should return false for already processed transcript with same hash', async () => {
      await processedLog.recordProcessed(
        'existing.jsonl',
        '/source/existing.jsonl',
        'hash123',
        new Date(),
        ['memory1']
      );

      const needs = await processedLog.needsProcessing('existing.jsonl', 'hash123');
      expect(needs).toBe(false);
    });

    it('should return true for processed transcript with different hash', async () => {
      await processedLog.recordProcessed(
        'modified.jsonl',
        '/source/modified.jsonl',
        'oldhash',
        new Date(),
        ['memory1']
      );

      const needs = await processedLog.needsProcessing('modified.jsonl', 'newhash');
      expect(needs).toBe(true);
    });
  });

  describe('recordProcessed', () => {
    it('should record a processed transcript', async () => {
      const filename = 'test.jsonl';
      const sourcePath = '/source/test.jsonl';
      const contentHash = 'abc123';
      const lastModified = new Date();
      const memoryIds = ['id1', 'id2'];

      await processedLog.recordProcessed(filename, sourcePath, contentHash, lastModified, memoryIds);

      const entry = await processedLog.getEntry(filename);

      expect(entry).not.toBeNull();
      expect(entry?.sourcePath).toBe(sourcePath);
      expect(entry?.contentHash).toBe(contentHash);
      expect(entry?.memoriesCreated).toEqual(memoryIds);
    });

    it('should persist to disk as JSONL', async () => {
      await processedLog.recordProcessed(
        'persisted.jsonl',
        '/source/persisted.jsonl',
        'hash456',
        new Date(),
        ['memory1']
      );

      // Clear cache and reload
      processedLog.clearCache();
      const entry = await processedLog.getEntry('persisted.jsonl');

      expect(entry).not.toBeNull();
      expect(entry?.contentHash).toBe('hash456');
    });

    it('should append entries to JSONL file', async () => {
      await processedLog.recordProcessed('first.jsonl', '/source/first.jsonl', 'hash1', new Date(), []);
      await processedLog.recordProcessed('second.jsonl', '/source/second.jsonl', 'hash2', new Date(), []);

      const content = await fs.readFile(path.join(testDir, 'processed-log.jsonl'), 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).filename).toBe('first.jsonl');
      expect(JSON.parse(lines[1]).filename).toBe('second.jsonl');
    });
  });

  describe('getMemoryIds', () => {
    it('should return memory IDs for a processed transcript', async () => {
      await processedLog.recordProcessed('test.jsonl', '/source/test.jsonl', 'hash', new Date(), [
        'mem1',
        'mem2',
        'mem3',
      ]);

      const ids = await processedLog.getMemoryIds('test.jsonl');
      expect(ids).toEqual(['mem1', 'mem2', 'mem3']);
    });

    it('should return empty array for unknown transcript', async () => {
      const ids = await processedLog.getMemoryIds('unknown.jsonl');
      expect(ids).toEqual([]);
    });
  });

  describe('removeEntry', () => {
    it('should remove entry and return memory IDs', async () => {
      await processedLog.recordProcessed('to-remove.jsonl', '/source/to-remove.jsonl', 'hash', new Date(), [
        'mem1',
        'mem2',
      ]);

      const removedIds = await processedLog.removeEntry('to-remove.jsonl');

      expect(removedIds).toEqual(['mem1', 'mem2']);

      const entry = await processedLog.getEntry('to-remove.jsonl');
      expect(entry).toBeNull();
    });

    it('should return empty array for non-existent entry', async () => {
      const removedIds = await processedLog.removeEntry('non-existent.jsonl');
      expect(removedIds).toEqual([]);
    });

    it('should append remove entry to JSONL file', async () => {
      await processedLog.recordProcessed('to-remove.jsonl', '/source/to-remove.jsonl', 'hash', new Date(), []);
      await processedLog.removeEntry('to-remove.jsonl');

      const content = await fs.readFile(path.join(testDir, 'processed-log.jsonl'), 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());

      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[1]).action).toBe('remove');
      expect(JSON.parse(lines[1]).filename).toBe('to-remove.jsonl');
    });
  });

  describe('listProcessed', () => {
    it('should list all processed transcripts', async () => {
      await processedLog.recordProcessed('first.jsonl', '/source/first.jsonl', 'hash1', new Date(), []);
      await processedLog.recordProcessed('second.jsonl', '/source/second.jsonl', 'hash2', new Date(), []);

      const list = await processedLog.listProcessed();

      expect(list).toHaveLength(2);
      expect(list.map((l) => l.filename)).toContain('first.jsonl');
      expect(list.map((l) => l.filename)).toContain('second.jsonl');
    });
  });

  describe('compact', () => {
    it('should compact file to current state only', async () => {
      // Add and remove entries to create a messy log
      await processedLog.recordProcessed('keep.jsonl', '/source/keep.jsonl', 'hash1', new Date(), ['mem1']);
      await processedLog.recordProcessed('remove.jsonl', '/source/remove.jsonl', 'hash2', new Date(), ['mem2']);
      await processedLog.removeEntry('remove.jsonl');
      await processedLog.recordProcessed('keep.jsonl', '/source/keep.jsonl', 'hash3', new Date(), ['mem3']); // Update

      // Before compact: 4 entries
      let content = await fs.readFile(path.join(testDir, 'processed-log.jsonl'), 'utf-8');
      let lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(4);

      // Compact
      await processedLog.compact();

      // After compact: 1 entry (only the current state)
      content = await fs.readFile(path.join(testDir, 'processed-log.jsonl'), 'utf-8');
      lines = content.split('\n').filter((l) => l.trim());
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0]).filename).toBe('keep.jsonl');
      expect(JSON.parse(lines[0]).contentHash).toBe('hash3');
    });

    it('should delete file when no entries remain', async () => {
      await processedLog.recordProcessed('temp.jsonl', '/source/temp.jsonl', 'hash', new Date(), []);
      await processedLog.removeEntry('temp.jsonl');

      await processedLog.compact();

      const exists = await fs
        .access(path.join(testDir, 'processed-log.jsonl'))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);
    });
  });
});
