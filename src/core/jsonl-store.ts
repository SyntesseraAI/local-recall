/**
 * Generic JSONL Store - Multi-file
 *
 * Provides an append-only log storage pattern for memories.
 * Splits entries across multiple files to avoid large file issues.
 *
 * Features:
 * - Append-only writes (atomic on most filesystems)
 * - Multiple files with configurable entries per file (default 500)
 * - Sequential file naming: {prefix}-000001.jsonl, {prefix}-000002.jsonl, etc.
 * - Replay-based state reconstruction from all files
 * - In-memory caching for fast reads
 * - Auto-compaction when delete ratio is high
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { type CompactionConfig, type CompactionStatus, compactionConfigSchema } from './jsonl-types.js';

/** Default entries per file */
const DEFAULT_ENTRIES_PER_FILE = 500;

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
  /** Base directory for JSONL files */
  baseDir: string;
  /** File prefix (e.g., "episodic" for episodic-001.jsonl) */
  filePrefix: string;
  /** Maximum entries per file (default 500) */
  entriesPerFile?: number;
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
 * Statistics about the JSONL files
 */
export interface JsonlStats {
  totalEntries: number;
  addEntries: number;
  deleteEntries: number;
  embeddingEntries: number;
  activeMemories: number;
  memoriesWithEmbeddings: number;
  totalFileSizeBytes: number;
  fileCount: number;
  currentFileEntries: number;
}

/**
 * Generic JSONL Store class - Multi-file
 *
 * Manages an append-only log of entries split across multiple files.
 */
export class JsonlStore<TEntry extends BaseEntry, TMemory extends { id: string }> {
  private baseDir: string;
  private filePrefix: string;
  private entriesPerFile: number;
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
  private currentFileNumber: number = 1;
  private currentFileEntryCount: number = 0;

  constructor(options: JsonlStoreOptions<TEntry, TMemory>) {
    this.baseDir = options.baseDir;
    this.filePrefix = options.filePrefix;
    this.entriesPerFile = options.entriesPerFile ?? DEFAULT_ENTRIES_PER_FILE;
    this.entrySchema = options.entrySchema;
    this.entryToMemory = options.entryToMemory;
    this.getEntryId = options.getEntryId;
    this.isDeleteEntry = options.isDeleteEntry;
    this.isEmbeddingEntry = options.isEmbeddingEntry;
    this.getEmbedding = options.getEmbedding;
    this.compactionConfig = compactionConfigSchema.parse(options.compactionConfig ?? {});
  }

  /**
   * Get the file path for a given file number
   */
  private getFilePathForNumber(fileNumber: number): string {
    const paddedNumber = String(fileNumber).padStart(6, '0');
    return path.join(this.baseDir, `${this.filePrefix}-${paddedNumber}.jsonl`);
  }

  /**
   * Get all JSONL files for this store, sorted by number
   */
  private async getExistingFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.baseDir);
      const pattern = new RegExp(`^${this.filePrefix}-(\\d{6})\\.jsonl$`);

      return files
        .filter((f) => pattern.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.match(pattern)![1]!, 10);
          const numB = parseInt(b.match(pattern)![1]!, 10);
          return numA - numB;
        })
        .map((f) => path.join(this.baseDir, f));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Count entries in a single file
   */
  private async countEntriesInFile(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content.split('\n').filter((line) => line.trim()).length;
    } catch {
      return 0;
    }
  }

  /**
   * Load all JSONL files and replay entries to build state
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
      totalFileSizeBytes: 0,
      fileCount: 0,
      currentFileEntries: 0,
    };

    const files = await this.getExistingFiles();
    this.stats.fileCount = files.length;

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.stats.totalFileSizeBytes += Buffer.byteLength(content, 'utf-8');

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
              logger.memory.warn(`Truncated last line in ${filePath}, skipping`);
            } else {
              logger.memory.warn(`Invalid JSONL entry in ${filePath} line ${i + 1}, skipping`);
            }
          }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          logger.memory.error(`Failed to load JSONL file ${filePath}: ${error}`);
          throw error;
        }
      }
    }

    // Determine current file number and entry count
    if (files.length > 0) {
      const lastFile = files[files.length - 1]!;
      const match = lastFile.match(/-(\d{6})\.jsonl$/);
      this.currentFileNumber = match ? parseInt(match[1]!, 10) : 1;
      this.currentFileEntryCount = await this.countEntriesInFile(lastFile);
    } else {
      this.currentFileNumber = 1;
      this.currentFileEntryCount = 0;
    }

    this.stats.activeMemories = this.memories.size;
    this.stats.memoriesWithEmbeddings = this.embeddings.size;
    this.stats.currentFileEntries = this.currentFileEntryCount;

    logger.memory.debug(
      `Loaded ${this.stats.fileCount} JSONL files: ${this.memories.size} memories, ${this.embeddings.size} embeddings`
    );
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
   * Append an entry to the current JSONL file
   * Creates a new file if current file has reached entry limit
   */
  async appendEntry(entry: TEntry): Promise<void> {
    await this.load(); // Ensure state is loaded

    await fs.mkdir(this.baseDir, { recursive: true });

    // Check if we need to create a new file
    if (this.currentFileEntryCount >= this.entriesPerFile) {
      this.currentFileNumber++;
      this.currentFileEntryCount = 0;
      if (this.stats) this.stats.fileCount++;
    }

    const filePath = this.getFilePathForNumber(this.currentFileNumber);
    const line = JSON.stringify(entry) + '\n';
    await fs.appendFile(filePath, line, 'utf-8');

    // Update in-memory state
    this.applyEntry(entry);
    this.currentFileEntryCount++;

    // Update stats
    if (this.stats) {
      this.stats.totalEntries++;
      this.stats.totalFileSizeBytes += Buffer.byteLength(line, 'utf-8');
      this.stats.activeMemories = this.memories?.size ?? 0;
      this.stats.memoriesWithEmbeddings = this.embeddings?.size ?? 0;
      this.stats.currentFileEntries = this.currentFileEntryCount;
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

    const fileSizeMb = this.stats.totalFileSizeBytes / (1024 * 1024);

    // Check total file size threshold
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
   * Compact by rewriting only current state across multiple files
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
    const existingFiles = await this.getExistingFiles();

    if (!this.memories || this.memories.size === 0) {
      // Nothing to compact, delete all files
      for (const file of existingFiles) {
        try {
          await fs.unlink(file);
        } catch {
          // Ignore if file doesn't exist
        }
      }
      this.clearCache();
      return { originalLines, newLines: 0 };
    }

    // Create backup of all files
    const backupPaths: string[] = [];
    const backupSuffix = `.backup-${Date.now()}`;
    for (const file of existingFiles) {
      const backupPath = file + backupSuffix;
      try {
        await fs.copyFile(file, backupPath);
        backupPaths.push(backupPath);
      } catch {
        // File might not exist
      }
    }

    try {
      // Build entries for each memory + its embedding
      const allEntries: string[] = [];
      for (const [id, memory] of this.memories) {
        // Add entry
        const addEntry = createAddEntry(memory);
        allEntries.push(JSON.stringify(addEntry));

        // Embedding entry if exists
        const embedding = this.embeddings?.get(id);
        if (embedding) {
          const embeddingEntry = createEmbeddingEntry(id, embedding);
          allEntries.push(JSON.stringify(embeddingEntry));
        }
      }

      // Split entries across files
      const newFileCount = Math.ceil(allEntries.length / this.entriesPerFile);
      const tempFiles: string[] = [];

      for (let fileNum = 1; fileNum <= newFileCount; fileNum++) {
        const startIdx = (fileNum - 1) * this.entriesPerFile;
        const endIdx = Math.min(startIdx + this.entriesPerFile, allEntries.length);
        const fileEntries = allEntries.slice(startIdx, endIdx);

        const tempPath = this.getFilePathForNumber(fileNum) + '.compact.tmp';
        await fs.writeFile(tempPath, fileEntries.join('\n') + '\n', 'utf-8');
        tempFiles.push(tempPath);
      }

      // Delete old files
      for (const file of existingFiles) {
        try {
          await fs.unlink(file);
        } catch {
          // Ignore
        }
      }

      // Rename temp files to final names
      for (let i = 0; i < tempFiles.length; i++) {
        const tempPath = tempFiles[i]!;
        const finalPath = this.getFilePathForNumber(i + 1);
        await fs.rename(tempPath, finalPath);
      }

      // Clear cache to force reload
      this.clearCache();

      // Delete backups after successful compaction
      for (const backupPath of backupPaths) {
        try {
          await fs.unlink(backupPath);
        } catch {
          // Ignore
        }
      }

      logger.memory.info(
        `Compacted JSONL: ${originalLines} → ${allEntries.length} entries across ${newFileCount} files`
      );
      return { originalLines, newLines: allEntries.length };
    } catch (error) {
      // Restore from backups on failure
      for (const backupPath of backupPaths) {
        const originalPath = backupPath.replace(backupSuffix, '');
        try {
          await fs.copyFile(backupPath, originalPath);
          await fs.unlink(backupPath);
        } catch {
          // Backup might not exist
        }
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
    this.currentFileNumber = 1;
    this.currentFileEntryCount = 0;
  }

  /**
   * Get the base directory
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Get the file prefix
   */
  getFilePrefix(): string {
    return this.filePrefix;
  }

  /**
   * Get the current file path (for backwards compatibility)
   */
  getFilePath(): string {
    return this.getFilePathForNumber(this.currentFileNumber);
  }
}
