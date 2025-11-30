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

    it('should load existing log from disk', async () => {
      // Create a log file
      const logContent = {
        version: 1,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        transcripts: {
          'test.jsonl': {
            sourcePath: '/source/test.jsonl',
            contentHash: 'abc123',
            lastModified: '2024-01-01T00:00:00.000Z',
            processedAt: '2024-01-01T00:00:00.000Z',
            memoriesCreated: ['id1', 'id2'],
          },
        },
      };
      await fs.writeFile(
        path.join(testDir, 'processed-log.json'),
        JSON.stringify(logContent),
        'utf-8'
      );

      const log = await processedLog.load();

      expect(log.transcripts['test.jsonl']).toBeDefined();
      expect(log.transcripts['test.jsonl'].contentHash).toBe('abc123');
      expect(log.transcripts['test.jsonl'].memoriesCreated).toEqual(['id1', 'id2']);
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

      await processedLog.recordProcessed(
        filename,
        sourcePath,
        contentHash,
        lastModified,
        memoryIds
      );

      const entry = await processedLog.getEntry(filename);

      expect(entry).not.toBeNull();
      expect(entry?.sourcePath).toBe(sourcePath);
      expect(entry?.contentHash).toBe(contentHash);
      expect(entry?.memoriesCreated).toEqual(memoryIds);
    });

    it('should persist to disk', async () => {
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
  });

  describe('getMemoryIds', () => {
    it('should return memory IDs for a processed transcript', async () => {
      await processedLog.recordProcessed(
        'test.jsonl',
        '/source/test.jsonl',
        'hash',
        new Date(),
        ['mem1', 'mem2', 'mem3']
      );

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
      await processedLog.recordProcessed(
        'to-remove.jsonl',
        '/source/to-remove.jsonl',
        'hash',
        new Date(),
        ['mem1', 'mem2']
      );

      const removedIds = await processedLog.removeEntry('to-remove.jsonl');

      expect(removedIds).toEqual(['mem1', 'mem2']);

      const entry = await processedLog.getEntry('to-remove.jsonl');
      expect(entry).toBeNull();
    });

    it('should return empty array for non-existent entry', async () => {
      const removedIds = await processedLog.removeEntry('non-existent.jsonl');
      expect(removedIds).toEqual([]);
    });
  });

  describe('listProcessed', () => {
    it('should list all processed transcripts', async () => {
      await processedLog.recordProcessed(
        'first.jsonl',
        '/source/first.jsonl',
        'hash1',
        new Date(),
        []
      );
      await processedLog.recordProcessed(
        'second.jsonl',
        '/source/second.jsonl',
        'hash2',
        new Date(),
        []
      );

      const list = await processedLog.listProcessed();

      expect(list).toHaveLength(2);
      expect(list.map((l) => l.filename)).toContain('first.jsonl');
      expect(list.map((l) => l.filename)).toContain('second.jsonl');
    });
  });
});
