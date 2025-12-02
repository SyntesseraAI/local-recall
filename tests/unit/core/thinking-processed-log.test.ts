import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ThinkingProcessedLogManager } from '../../../src/core/thinking-processed-log.js';

describe('ThinkingProcessedLogManager', () => {
  let testDir: string;
  let logManager: ThinkingProcessedLogManager;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'local-recall-thinking-log-test-'));
    // Set environment variable for config
    process.env['LOCAL_RECALL_DIR'] = testDir;
    logManager = new ThinkingProcessedLogManager(testDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(testDir, { recursive: true, force: true });
    delete process.env['LOCAL_RECALL_DIR'];
  });

  describe('load', () => {
    it('should start with empty log when file does not exist', async () => {
      const log = await logManager.load();
      expect(log.version).toBe(1);
      expect(Object.keys(log.transcripts)).toHaveLength(0);
    });

    it('should load existing log entries', async () => {
      // Create a log file manually
      const logPath = path.join(testDir, 'thinking-processed-log.jsonl');
      await fs.mkdir(testDir, { recursive: true });
      const entry = {
        action: 'add',
        filename: 'test-transcript.jsonl',
        sourcePath: '/path/to/source',
        contentHash: 'abc123',
        lastModified: '2025-01-01T00:00:00.000Z',
        processedAt: '2025-01-01T01:00:00.000Z',
        memoriesCreated: ['memory-1', 'memory-2'],
      };
      await fs.writeFile(logPath, JSON.stringify(entry) + '\n', 'utf-8');

      const log = await logManager.load();
      expect(Object.keys(log.transcripts)).toHaveLength(1);
      expect(log.transcripts['test-transcript.jsonl']).toBeDefined();
    });
  });

  describe('needsProcessing', () => {
    it('should return true for unprocessed transcript', async () => {
      const needs = await logManager.needsProcessing('new-transcript.jsonl', 'hash123');
      expect(needs).toBe(true);
    });

    it('should return false for processed transcript with same hash', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1']
      );

      const needs = await logManager.needsProcessing('test.jsonl', 'hash123');
      expect(needs).toBe(false);
    });

    it('should return true for processed transcript with different hash', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1']
      );

      const needs = await logManager.needsProcessing('test.jsonl', 'differenthash');
      expect(needs).toBe(true);
    });
  });

  describe('recordProcessed', () => {
    it('should record a processed transcript', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1', 'memory-2']
      );

      const entry = await logManager.getEntry('test.jsonl');
      expect(entry).not.toBeNull();
      expect(entry?.contentHash).toBe('hash123');
      expect(entry?.memoriesCreated).toEqual(['memory-1', 'memory-2']);
    });

    it('should create JSONL file', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1']
      );

      const logPath = path.join(testDir, 'thinking-processed-log.jsonl');
      const exists = await fs.access(logPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('getMemoryIds', () => {
    it('should return memory IDs for processed transcript', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1', 'memory-2', 'memory-3']
      );

      const ids = await logManager.getMemoryIds('test.jsonl');
      expect(ids).toEqual(['memory-1', 'memory-2', 'memory-3']);
    });

    it('should return empty array for unknown transcript', async () => {
      const ids = await logManager.getMemoryIds('unknown.jsonl');
      expect(ids).toEqual([]);
    });
  });

  describe('removeEntry', () => {
    it('should remove entry and return memory IDs', async () => {
      await logManager.recordProcessed(
        'test.jsonl',
        '/path/to/source',
        'hash123',
        new Date('2025-01-01'),
        ['memory-1', 'memory-2']
      );

      const ids = await logManager.removeEntry('test.jsonl');
      expect(ids).toEqual(['memory-1', 'memory-2']);

      const entry = await logManager.getEntry('test.jsonl');
      expect(entry).toBeNull();
    });

    it('should return empty array when removing non-existent entry', async () => {
      const ids = await logManager.removeEntry('unknown.jsonl');
      expect(ids).toEqual([]);
    });
  });

  describe('listProcessed', () => {
    it('should list all processed transcripts', async () => {
      await logManager.recordProcessed(
        'test1.jsonl',
        '/path/to/source1',
        'hash1',
        new Date('2025-01-01'),
        ['memory-1']
      );

      await logManager.recordProcessed(
        'test2.jsonl',
        '/path/to/source2',
        'hash2',
        new Date('2025-01-02'),
        ['memory-2']
      );

      const list = await logManager.listProcessed();
      expect(list).toHaveLength(2);
      expect(list.map(l => l.filename).sort()).toEqual(['test1.jsonl', 'test2.jsonl']);
    });
  });

  describe('compact', () => {
    it('should compact log by removing superseded entries', async () => {
      // Record, update, and remove entries
      await logManager.recordProcessed(
        'test1.jsonl',
        '/path/1',
        'hash1',
        new Date('2025-01-01'),
        ['memory-1']
      );

      await logManager.recordProcessed(
        'test2.jsonl',
        '/path/2',
        'hash2',
        new Date('2025-01-02'),
        ['memory-2']
      );

      await logManager.removeEntry('test2.jsonl');

      // Compact
      await logManager.compact();

      // Reload and verify only test1 remains
      logManager.clearCache();
      const list = await logManager.listProcessed();
      expect(list).toHaveLength(1);
      expect(list[0]?.filename).toBe('test1.jsonl');
    });
  });
});
