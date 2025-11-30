import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Schema for a processed transcript entry
 */
export const processedTranscriptEntrySchema = z.object({
  /** Original source path (from Claude cache) */
  sourcePath: z.string(),
  /** SHA-256 hash of content (16 chars) */
  contentHash: z.string(),
  /** Last modified timestamp of source file */
  lastModified: z.string().datetime(),
  /** When this transcript was processed */
  processedAt: z.string().datetime(),
  /** IDs of memories created from this transcript */
  memoriesCreated: z.array(z.string()),
});

export type ProcessedTranscriptEntry = z.infer<typeof processedTranscriptEntrySchema>;

/**
 * Schema for the processed log file
 */
export const processedLogSchema = z.object({
  version: z.number().default(1),
  lastUpdated: z.string().datetime(),
  transcripts: z.record(z.string(), processedTranscriptEntrySchema),
});

export type ProcessedLog = z.infer<typeof processedLogSchema>;

/**
 * Processed Log Manager - tracks which transcripts have been processed
 */
export class ProcessedLogManager {
  private logPath: string;
  private cache: ProcessedLog | null = null;

  constructor(baseDir?: string) {
    const config = getConfig();
    const dir = baseDir ?? config.memoryDir;
    this.logPath = path.join(dir, 'processed-log.json');
  }

  /**
   * Load the processed log from disk
   */
  async load(): Promise<ProcessedLog> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const content = await fs.readFile(this.logPath, 'utf-8');
      const parsed = JSON.parse(content);
      this.cache = processedLogSchema.parse(parsed);
      return this.cache;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return empty log
        const emptyLog: ProcessedLog = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          transcripts: {},
        };
        this.cache = emptyLog;
        return emptyLog;
      }
      logger.transcript.error('Failed to load processed log', error);
      throw error;
    }
  }

  /**
   * Save the processed log to disk
   */
  async save(): Promise<void> {
    if (!this.cache) {
      return;
    }

    this.cache.lastUpdated = new Date().toISOString();

    const dir = path.dirname(this.logPath);
    await fs.mkdir(dir, { recursive: true });

    // Write atomically
    const tempPath = `${this.logPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(this.cache, null, 2), 'utf-8');
    await fs.rename(tempPath, this.logPath);

    logger.transcript.debug('Saved processed log');
  }

  /**
   * Get the entry for a transcript by filename
   */
  async getEntry(filename: string): Promise<ProcessedTranscriptEntry | null> {
    const log = await this.load();
    return log.transcripts[filename] ?? null;
  }

  /**
   * Check if a transcript needs processing
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
   * Record that a transcript has been processed
   */
  async recordProcessed(
    filename: string,
    sourcePath: string,
    contentHash: string,
    lastModified: Date,
    memoryIds: string[]
  ): Promise<void> {
    const log = await this.load();

    log.transcripts[filename] = {
      sourcePath,
      contentHash,
      lastModified: lastModified.toISOString(),
      processedAt: new Date().toISOString(),
      memoriesCreated: memoryIds,
    };

    await this.save();
    logger.transcript.info(`Recorded processed transcript: ${filename} (${memoryIds.length} memories)`);
  }

  /**
   * Get memory IDs created from a transcript
   */
  async getMemoryIds(filename: string): Promise<string[]> {
    const entry = await this.getEntry(filename);
    return entry?.memoriesCreated ?? [];
  }

  /**
   * Remove an entry and return its memory IDs (for cleanup before re-processing)
   */
  async removeEntry(filename: string): Promise<string[]> {
    const log = await this.load();
    const entry = log.transcripts[filename];

    if (!entry) {
      return [];
    }

    const memoryIds = entry.memoriesCreated;
    delete log.transcripts[filename];
    await this.save();

    logger.transcript.debug(`Removed processed entry: ${filename}`);
    return memoryIds;
  }

  /**
   * List all processed transcripts
   */
  async listProcessed(): Promise<Array<{ filename: string; entry: ProcessedTranscriptEntry }>> {
    const log = await this.load();
    return Object.entries(log.transcripts).map(([filename, entry]) => ({
      filename,
      entry,
    }));
  }

  /**
   * Clear the cache (for testing or forced reload)
   */
  clearCache(): void {
    this.cache = null;
  }
}
