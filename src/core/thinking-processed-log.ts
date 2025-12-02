import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Schema for a processed transcript entry for thinking memories
 */
export const thinkingProcessedTranscriptEntrySchema = z.object({
  /** Original source path (from Claude cache) */
  sourcePath: z.string(),
  /** SHA-256 hash of content (16 chars) */
  contentHash: z.string(),
  /** Last modified timestamp of source file */
  lastModified: z.string().datetime(),
  /** When this transcript was processed */
  processedAt: z.string().datetime(),
  /** IDs of thinking memories created from this transcript */
  memoriesCreated: z.array(z.string()),
});

export type ThinkingProcessedTranscriptEntry = z.infer<typeof thinkingProcessedTranscriptEntrySchema>;

/**
 * Schema for an "add" log entry
 */
const addEntrySchema = z.object({
  action: z.literal('add'),
  filename: z.string(),
  sourcePath: z.string(),
  contentHash: z.string(),
  lastModified: z.string().datetime(),
  processedAt: z.string().datetime(),
  memoriesCreated: z.array(z.string()),
});

/**
 * Schema for a "remove" log entry
 */
const removeEntrySchema = z.object({
  action: z.literal('remove'),
  filename: z.string(),
  removedAt: z.string().datetime(),
});

/**
 * Union schema for log entries
 */
const logEntrySchema = z.discriminatedUnion('action', [addEntrySchema, removeEntrySchema]);

type LogEntry = z.infer<typeof logEntrySchema>;

/**
 * In-memory state representation
 */
export interface ThinkingProcessedLog {
  version: number;
  lastUpdated: string;
  transcripts: Record<string, ThinkingProcessedTranscriptEntry>;
}

/**
 * Thinking Processed Log Manager - tracks which transcripts have been processed for thinking memories
 * Uses JSONL format for append-only, fast writes
 * Separate from the main processed log to allow independent reprocessing
 */
export class ThinkingProcessedLogManager {
  private logPath: string;
  private cache: Map<string, ThinkingProcessedTranscriptEntry> | null = null;

  constructor(baseDir?: string) {
    const config = getConfig();
    const dir = baseDir ?? config.memoryDir;
    this.logPath = path.join(dir, 'thinking-processed-log.jsonl');
  }

  /**
   * Load the processed log from disk by replaying JSONL entries
   */
  async load(): Promise<ThinkingProcessedLog> {
    if (this.cache) {
      return this.toProcessedLog();
    }

    this.cache = new Map();

    try {
      const content = await fs.readFile(this.logPath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const entry = logEntrySchema.parse(JSON.parse(line));
          this.applyEntry(entry);
        } catch {
          logger.transcript.warn(`Skipping invalid thinking log entry: ${line}`);
        }
      }

      logger.transcript.debug(`Loaded ${this.cache.size} processed transcripts from thinking JSONL`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, start with empty state
        logger.transcript.debug('No thinking processed log found, starting fresh');
      } else {
        logger.transcript.error('Failed to load thinking processed log', error);
        throw error;
      }
    }

    return this.toProcessedLog();
  }

  /**
   * Apply a log entry to the in-memory state
   */
  private applyEntry(entry: LogEntry): void {
    if (!this.cache) {
      this.cache = new Map();
    }

    if (entry.action === 'add') {
      this.cache.set(entry.filename, {
        sourcePath: entry.sourcePath,
        contentHash: entry.contentHash,
        lastModified: entry.lastModified,
        processedAt: entry.processedAt,
        memoriesCreated: entry.memoriesCreated,
      });
    } else if (entry.action === 'remove') {
      this.cache.delete(entry.filename);
    }
  }

  /**
   * Convert in-memory state to ThinkingProcessedLog format (for compatibility)
   */
  private toProcessedLog(): ThinkingProcessedLog {
    const transcripts: Record<string, ThinkingProcessedTranscriptEntry> = {};
    if (this.cache) {
      for (const [filename, entry] of this.cache) {
        transcripts[filename] = entry;
      }
    }
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      transcripts,
    };
  }

  /**
   * Append an entry to the JSONL file
   */
  private async appendEntry(entry: LogEntry): Promise<void> {
    const dir = path.dirname(this.logPath);
    await fs.mkdir(dir, { recursive: true });

    const line = JSON.stringify(entry) + '\n';
    await fs.appendFile(this.logPath, line, 'utf-8');
  }

  /**
   * Save is now a no-op since we append immediately
   * Kept for API compatibility
   */
  async save(): Promise<void> {
    // No-op - JSONL format appends immediately
    logger.transcript.debug('Save called (no-op for JSONL format)');
  }

  /**
   * Get the entry for a transcript by filename
   */
  async getEntry(filename: string): Promise<ThinkingProcessedTranscriptEntry | null> {
    await this.load();
    return this.cache?.get(filename) ?? null;
  }

  /**
   * Check if a transcript needs processing for thinking memories
   * Returns true if:
   * - Not in the log
   * - Content hash has changed
   */
  async needsProcessing(filename: string, contentHash: string): Promise<boolean> {
    const entry = await this.getEntry(filename);

    if (!entry) {
      return true; // Not processed yet
    }

    if (entry.contentHash !== contentHash) {
      return true; // Content changed
    }

    return false; // Already processed and unchanged
  }

  /**
   * Record that a transcript has been processed for thinking memories
   */
  async recordProcessed(
    filename: string,
    sourcePath: string,
    contentHash: string,
    lastModified: Date,
    memoryIds: string[]
  ): Promise<void> {
    await this.load(); // Ensure cache is loaded

    const entry: z.infer<typeof addEntrySchema> = {
      action: 'add',
      filename,
      sourcePath,
      contentHash,
      lastModified: lastModified.toISOString(),
      processedAt: new Date().toISOString(),
      memoriesCreated: memoryIds,
    };

    // Append to file
    await this.appendEntry(entry);

    // Update cache
    this.applyEntry(entry);

    logger.transcript.info(`Recorded processed transcript for thinking: ${filename} (${memoryIds.length} thinking memories)`);
  }

  /**
   * Get thinking memory IDs created from a transcript
   */
  async getMemoryIds(filename: string): Promise<string[]> {
    const entry = await this.getEntry(filename);
    return entry?.memoriesCreated ?? [];
  }

  /**
   * Remove an entry and return its thinking memory IDs (for cleanup before re-processing)
   */
  async removeEntry(filename: string): Promise<string[]> {
    await this.load(); // Ensure cache is loaded

    const existingEntry = this.cache?.get(filename);
    if (!existingEntry) {
      return [];
    }

    const memoryIds = existingEntry.memoriesCreated;

    const entry: z.infer<typeof removeEntrySchema> = {
      action: 'remove',
      filename,
      removedAt: new Date().toISOString(),
    };

    // Append to file
    await this.appendEntry(entry);

    // Update cache
    this.applyEntry(entry);

    logger.transcript.debug(`Removed thinking processed entry: ${filename}`);
    return memoryIds;
  }

  /**
   * List all processed transcripts for thinking memories
   */
  async listProcessed(): Promise<Array<{ filename: string; entry: ThinkingProcessedTranscriptEntry }>> {
    await this.load();
    const result: Array<{ filename: string; entry: ThinkingProcessedTranscriptEntry }> = [];
    if (this.cache) {
      for (const [filename, entry] of this.cache) {
        result.push({ filename, entry });
      }
    }
    return result;
  }

  /**
   * Clear the cache (for testing or forced reload)
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Compact the JSONL file by rewriting only the current state
   * This removes old/superseded entries and deleted items
   */
  async compact(): Promise<void> {
    await this.load();

    if (!this.cache || this.cache.size === 0) {
      // Nothing to compact, delete the file if it exists
      try {
        await fs.unlink(this.logPath);
      } catch {
        // Ignore if file doesn't exist
      }
      return;
    }

    // Write all current entries to a new file
    const tempPath = `${this.logPath}.tmp`;
    const lines: string[] = [];

    for (const [filename, entry] of this.cache) {
      const logEntry: z.infer<typeof addEntrySchema> = {
        action: 'add',
        filename,
        sourcePath: entry.sourcePath,
        contentHash: entry.contentHash,
        lastModified: entry.lastModified,
        processedAt: entry.processedAt,
        memoriesCreated: entry.memoriesCreated,
      };
      lines.push(JSON.stringify(logEntry));
    }

    await fs.writeFile(tempPath, lines.join('\n') + '\n', 'utf-8');
    await fs.rename(tempPath, this.logPath);

    logger.transcript.info(`Compacted thinking processed log to ${this.cache.size} entries`);
  }
}
