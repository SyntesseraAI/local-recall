/**
 * Generic JSONL Store
 *
 * Provides an append-only log storage pattern for memories.
 * Based on the pattern from processed-log.ts but generic for reuse.
 *
 * Features:
 * - Append-only writes (atomic on most filesystems)
 * - Replay-based state reconstruction
 * - In-memory caching for fast reads
 * - Auto-compaction when file grows large
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { type CompactionConfig, type CompactionStatus, compactionConfigSchema } from './jsonl-types.js';

/**
 * Base interface for all JSONL entries
 */
export interface BaseEntry {
  action: string;
  timestamp: string;
}

/**
 * Options for creating a JSONL store
 */
export interface JsonlStoreOptions<TEntry extends BaseEntry, TMemory> {
  /** Path to the JSONL file */
  filePath: string;
  /** Zod schema for validating entries (type is loosened to avoid Zod inference issues) */
  entrySchema: z.ZodType<unknown>;
  /** Convert an add entry to a memory object */
  entryToMemory: (entry: TEntry) => TMemory | null;
  /** Get the ID from an entry */
  getEntryId: (entry: TEntry) => string;
  /** Check if entry is a delete action */
  isDeleteEntry: (entry: TEntry) => boolean;
  /** Check if entry is an embedding action */
  isEmbeddingEntry: (entry: TEntry) => boolean;
  /** Get embedding from entry (if embedding entry) */
  getEmbedding: (entry: TEntry) => number[] | null;
  /** Compaction configuration */
  compactionConfig?: Partial<CompactionConfig>;
}

/**
 * Statistics about the JSONL file
 */
export interface JsonlStats {
  totalEntries: number;
  addEntries: number;
  deleteEntries: number;
  embeddingEntries: number;
  activeMemories: number;
  memoriesWithEmbeddings: number;
  fileSizeBytes: number;
}

/**
 * Generic JSONL Store class
 *
 * Manages an append-only log of entries that can be replayed to reconstruct state.
 */
export class JsonlStore<TEntry extends BaseEntry, TMemory extends { id: string }> {
  private filePath: string;
  private entrySchema: z.ZodType<unknown>;
  private entryToMemory: (entry: TEntry) => TMemory | null;
  private getEntryId: (entry: TEntry) => string;
  private isDeleteEntry: (entry: TEntry) => boolean;
  private isEmbeddingEntry: (entry: TEntry) => boolean;
  private getEmbedding: (entry: TEntry) => number[] | null;
  private compactionConfig: CompactionConfig;

  // In-memory state
  private memories: Map<string, TMemory> | null = null;
  private embeddings: Map<string, number[]> | null = null;
  private stats: JsonlStats | null = null;

  constructor(options: JsonlStoreOptions<TEntry, TMemory>) {
    this.filePath = options.filePath;
    this.entrySchema = options.entrySchema;
    this.entryToMemory = options.entryToMemory;
    this.getEntryId = options.getEntryId;
    this.isDeleteEntry = options.isDeleteEntry;
    this.isEmbeddingEntry = options.isEmbeddingEntry;
    this.getEmbedding = options.getEmbedding;
    this.compactionConfig = compactionConfigSchema.parse(options.compactionConfig ?? {});
  }

  /**
   * Load the JSONL file and replay entries to build state
   */
  async load(): Promise<void> {
    if (this.memories !== null) {
      return; // Already loaded
    }

    this.memories = new Map();
    this.embeddings = new Map();
    this.stats = {
      totalEntries: 0,
      addEntries: 0,
      deleteEntries: 0,
      embeddingEntries: 0,
      activeMemories: 0,
      memoriesWithEmbeddings: 0,
      fileSizeBytes: 0,
    };

    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.stats.fileSizeBytes = Buffer.byteLength(content, 'utf-8');

      const lines = content.split('\n').filter((line) => line.trim());

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        try {
          const parsed = JSON.parse(line);
          const entry = this.entrySchema.parse(parsed) as TEntry;
          this.applyEntry(entry);
          this.stats.totalEntries++;
        } catch {
          // Last line might be truncated from power failure
          if (i === lines.length - 1) {
            logger.memory.warn(`Truncated last line in JSONL, skipping: ${line.slice(0, 50)}...`);
          } else {
            logger.memory.warn(`Invalid JSONL entry at line ${i + 1}, skipping: ${line.slice(0, 50)}...`);
          }
        }
      }

      this.stats.activeMemories = this.memories.size;
      this.stats.memoriesWithEmbeddings = this.embeddings.size;

      logger.memory.debug(
        `Loaded JSONL: ${this.memories.size} memories, ${this.embeddings.size} embeddings`
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.memory.debug('No JSONL file found, starting fresh');
      } else {
        logger.memory.error(`Failed to load JSONL file: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Apply an entry to the in-memory state
   */
  private applyEntry(entry: TEntry): void {
    const id = this.getEntryId(entry);

    if (this.isDeleteEntry(entry)) {
      this.memories?.delete(id);
      this.embeddings?.delete(id);
      if (this.stats) this.stats.deleteEntries++;
    } else if (this.isEmbeddingEntry(entry)) {
      const embedding = this.getEmbedding(entry);
      if (embedding && this.embeddings) {
        this.embeddings.set(id, embedding);
      }
      if (this.stats) this.stats.embeddingEntries++;
    } else {
      // Add entry
      const memory = this.entryToMemory(entry);
      if (memory && this.memories) {
        this.memories.set(id, memory);
      }
      if (this.stats) this.stats.addEntries++;
    }
  }

  /**
   * Append an entry to the JSONL file
   */
  async appendEntry(entry: TEntry): Promise<void> {
    await this.load(); // Ensure state is loaded

    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    const line = JSON.stringify(entry) + '\n';
    await fs.appendFile(this.filePath, line, 'utf-8');

    // Update in-memory state
    this.applyEntry(entry);

    // Update stats
    if (this.stats) {
      this.stats.totalEntries++;
      this.stats.fileSizeBytes += Buffer.byteLength(line, 'utf-8');
      this.stats.activeMemories = this.memories?.size ?? 0;
      this.stats.memoriesWithEmbeddings = this.embeddings?.size ?? 0;
    }
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<TMemory | null> {
    await this.load();
    return this.memories?.get(id) ?? null;
  }

  /**
   * Get all memories
   */
  async listMemories(): Promise<TMemory[]> {
    await this.load();
    return Array.from(this.memories?.values() ?? []);
  }

  /**
   * Get the number of active memories
   */
  async count(): Promise<number> {
    await this.load();
    return this.memories?.size ?? 0;
  }

  /**
   * Check if a memory exists
   */
  async has(id: string): Promise<boolean> {
    await this.load();
    return this.memories?.has(id) ?? false;
  }

  /**
   * Get embedding for a memory
   */
  async getEmbeddingForMemory(id: string): Promise<number[] | null> {
    await this.load();
    return this.embeddings?.get(id) ?? null;
  }

  /**
   * Get all embeddings
   */
  async getAllEmbeddings(): Promise<Map<string, number[]>> {
    await this.load();
    return new Map(this.embeddings ?? []);
  }

  /**
   * Get memories that don't have embeddings
   */
  async getMemoriesWithoutEmbeddings(): Promise<TMemory[]> {
    await this.load();
    const result: TMemory[] = [];
    if (this.memories && this.embeddings) {
      for (const [id, memory] of this.memories) {
        if (!this.embeddings.has(id)) {
          result.push(memory);
        }
      }
    }
    return result;
  }

  /**
   * Get current statistics
   */
  async getStats(): Promise<JsonlStats> {
    await this.load();
    return { ...this.stats! };
  }

  /**
   * Check if compaction is needed
   */
  async needsCompaction(): Promise<CompactionStatus> {
    await this.load();

    if (!this.stats) {
      return { needsCompaction: false };
    }

    const fileSizeMb = this.stats.fileSizeBytes / (1024 * 1024);

    // Check file size threshold
    if (fileSizeMb > this.compactionConfig.maxFileSizeMb) {
      return {
        needsCompaction: true,
        reason: 'file_size',
        fileSizeMb,
      };
    }

    // Check delete ratio
    if (this.stats.totalEntries >= this.compactionConfig.minEntriesForRatioCheck) {
      const deleteRatio = this.stats.deleteEntries / this.stats.totalEntries;
      if (deleteRatio > this.compactionConfig.maxDeleteRatio) {
        return {
          needsCompaction: true,
          reason: 'delete_ratio',
          deleteRatio,
          totalEntries: this.stats.totalEntries,
        };
      }
    }

    return { needsCompaction: false };
  }

  /**
   * Compact the JSONL file by rewriting only current state
   *
   * @param createAddEntry - Function to create an add entry from a memory
   * @param createEmbeddingEntry - Function to create an embedding entry
   */
  async compact(
    createAddEntry: (memory: TMemory) => TEntry,
    createEmbeddingEntry: (id: string, embedding: number[]) => TEntry
  ): Promise<{ originalLines: number; newLines: number }> {
    await this.load();

    const originalLines = this.stats?.totalEntries ?? 0;

    if (!this.memories || this.memories.size === 0) {
      // Nothing to compact, delete file if it exists
      try {
        await fs.unlink(this.filePath);
      } catch {
        // Ignore if file doesn't exist
      }
      this.clearCache();
      return { originalLines, newLines: 0 };
    }

    // Create backup
    const backupPath = `${this.filePath}.backup-${Date.now()}`;
    try {
      await fs.copyFile(this.filePath, backupPath);
    } catch {
      // File might not exist yet
    }

    try {
      // Build new file content
      const lines: string[] = [];

      for (const [id, memory] of this.memories) {
        // Write add entry
        const addEntry = createAddEntry(memory);
        lines.push(JSON.stringify(addEntry));

        // Write embedding entry if exists
        const embedding = this.embeddings?.get(id);
        if (embedding) {
          const embeddingEntry = createEmbeddingEntry(id, embedding);
          lines.push(JSON.stringify(embeddingEntry));
        }
      }

      // Write to temp file then rename (atomic)
      const tempPath = `${this.filePath}.compact.tmp`;
      await fs.writeFile(tempPath, lines.join('\n') + '\n', 'utf-8');
      await fs.rename(tempPath, this.filePath);

      // Clear cache to force reload
      this.clearCache();

      // Delete backup after successful compaction
      try {
        await fs.unlink(backupPath);
      } catch {
        // Ignore if backup doesn't exist
      }

      logger.memory.info(`Compacted JSONL: ${originalLines} → ${lines.length} entries`);
      return { originalLines, newLines: lines.length };
    } catch (error) {
      // Restore from backup on failure
      try {
        await fs.copyFile(backupPath, this.filePath);
      } catch {
        // Backup might not exist
      }
      throw error;
    }
  }

  /**
   * Clear the in-memory cache (forces reload on next access)
   */
  clearCache(): void {
    this.memories = null;
    this.embeddings = null;
    this.stats = null;
  }

  /**
   * Get the file path
   */
  getFilePath(): string {
    return this.filePath;
  }
}
