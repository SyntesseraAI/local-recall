/**
 * Episodic JSONL Store
 *
 * High-level store for episodic memories using JSONL append-only format.
 * Wraps the generic JsonlStore with episodic-memory-specific logic.
 */

import path from 'node:path';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  type Memory,
  type MemoryScope,
  type CreateMemoryInput,
  createMemoryInputSchema,
} from './types.js';
import {
  type EpisodicEntry,
  type EpisodicAddEntry,
  type DeleteEntry,
  type EmbeddingEntry,
  episodicEntrySchema,
} from './jsonl-types.js';
import { JsonlStore } from './jsonl-store.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/** JSONL filename for episodic memories */
const EPISODIC_JSONL_FILENAME = 'episodic.jsonl';

/**
 * Compute SHA-256 hash of content (16-char prefix)
 */
function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Convert an episodic add entry to a Memory object
 */
function entryToMemory(entry: EpisodicEntry): Memory | null {
  if (entry.action !== 'add') {
    return null;
  }
  return {
    id: entry.id,
    subject: entry.subject,
    keywords: entry.keywords,
    applies_to: entry.applies_to as MemoryScope,
    occurred_at: entry.occurred_at,
    content_hash: entry.content_hash,
    content: entry.content,
  };
}

/**
 * Episodic JSONL Store Options
 */
export interface EpisodicJsonlStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
}

/**
 * Episodic JSONL Store
 *
 * Provides CRUD operations for episodic memories using JSONL storage.
 */
export class EpisodicJsonlStore {
  private store: JsonlStore<EpisodicEntry, Memory>;
  private baseDir: string;

  constructor(options: EpisodicJsonlStoreOptions = {}) {
    const config = getConfig();
    this.baseDir = options.baseDir ?? config.memoryDir;
    const filePath = path.join(this.baseDir, EPISODIC_JSONL_FILENAME);

    this.store = new JsonlStore<EpisodicEntry, Memory>({
      filePath,
      entrySchema: episodicEntrySchema,
      entryToMemory,
      getEntryId: (entry) => entry.id,
      isDeleteEntry: (entry) => entry.action === 'delete',
      isEmbeddingEntry: (entry) => entry.action === 'embedding',
      getEmbedding: (entry) => (entry.action === 'embedding' ? entry.embedding : null),
    });
  }

  /**
   * Initialize the store (loads existing data)
   */
  async initialize(): Promise<void> {
    await this.store.load();
  }

  /**
   * Create a new memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    logger.memory.debug(`Creating episodic memory: "${input.subject}"`);
    const validated = createMemoryInputSchema.parse(input);

    const now = new Date().toISOString();
    const occurredAt = validated.occurred_at ?? now;
    const contentHash = computeContentHash(validated.content);

    // Check for existing duplicate
    const existing = await this.findDuplicate(occurredAt, contentHash);
    if (existing) {
      logger.memory.info(`Duplicate memory found (${existing.id}), skipping creation`);
      return existing;
    }

    const id = uuidv4();

    const memory: Memory = {
      id,
      subject: validated.subject,
      keywords: validated.keywords,
      applies_to: validated.applies_to as MemoryScope,
      occurred_at: occurredAt,
      content_hash: contentHash,
      content: validated.content,
    };

    // Create add entry
    const entry: EpisodicAddEntry = {
      action: 'add',
      id: memory.id,
      subject: memory.subject,
      keywords: memory.keywords,
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      timestamp: now,
    };

    await this.store.appendEntry(entry);
    logger.memory.info(`Created episodic memory ${id}: "${memory.subject}"`);
    return memory;
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    return this.store.getMemory(id);
  }

  /**
   * Delete a memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    const exists = await this.store.has(id);
    if (!exists) {
      return false;
    }

    const entry: DeleteEntry = {
      action: 'delete',
      id,
      timestamp: new Date().toISOString(),
    };

    await this.store.appendEntry(entry);
    logger.memory.info(`Deleted episodic memory ${id}`);
    return true;
  }

  /**
   * List all memories with optional filtering
   */
  async listMemories(filter?: {
    scope?: MemoryScope;
    keyword?: string;
    limit?: number;
    offset?: number;
  }): Promise<Memory[]> {
    let memories = await this.store.listMemories();

    // Apply filters
    if (filter?.scope) {
      memories = memories.filter((m) => m.applies_to === filter.scope);
    }
    if (filter?.keyword) {
      memories = memories.filter((m) => m.keywords.includes(filter.keyword!));
    }

    // Sort by occurred_at descending (newest first)
    memories.sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

    // Apply pagination
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? memories.length;
    return memories.slice(offset, offset + limit);
  }

  /**
   * Find a duplicate memory by occurred_at and content_hash
   */
  async findDuplicate(occurredAt: string, contentHash: string): Promise<Memory | null> {
    const memories = await this.store.listMemories();
    return (
      memories.find(
        (m) => m.occurred_at === occurredAt && m.content_hash === contentHash
      ) ?? null
    );
  }

  /**
   * Store an embedding for a memory
   */
  async storeEmbedding(id: string, embedding: number[]): Promise<void> {
    const exists = await this.store.has(id);
    if (!exists) {
      logger.memory.warn(`Cannot store embedding: memory ${id} not found`);
      return;
    }

    const entry: EmbeddingEntry = {
      action: 'embedding',
      id,
      embedding,
      timestamp: new Date().toISOString(),
    };

    await this.store.appendEntry(entry);
    logger.memory.debug(`Stored embedding for memory ${id}`);
  }

  /**
   * Get embedding for a memory
   */
  async getEmbedding(id: string): Promise<number[] | null> {
    return this.store.getEmbeddingForMemory(id);
  }

  /**
   * Get all embeddings
   */
  async getAllEmbeddings(): Promise<Map<string, number[]>> {
    return this.store.getAllEmbeddings();
  }

  /**
   * Get memories that don't have embeddings yet
   */
  async getMemoriesNeedingEmbeddings(): Promise<Memory[]> {
    return this.store.getMemoriesWithoutEmbeddings();
  }

  /**
   * Get the number of active memories
   */
  async count(): Promise<number> {
    return this.store.count();
  }

  /**
   * Check if compaction is needed
   */
  async needsCompaction(): Promise<boolean> {
    const status = await this.store.needsCompaction();
    return status.needsCompaction;
  }

  /**
   * Compact the JSONL file
   */
  async compact(): Promise<{ originalLines: number; newLines: number }> {
    const now = new Date().toISOString();

    return this.store.compact(
      // Create add entry from memory
      (memory: Memory): EpisodicEntry => ({
        action: 'add',
        id: memory.id,
        subject: memory.subject,
        keywords: memory.keywords,
        applies_to: memory.applies_to,
        occurred_at: memory.occurred_at,
        content_hash: memory.content_hash,
        content: memory.content,
        timestamp: now,
      }),
      // Create embedding entry
      (id: string, embedding: number[]): EpisodicEntry => ({
        action: 'embedding',
        id,
        embedding,
        timestamp: now,
      })
    );
  }

  /**
   * Clear the in-memory cache
   */
  clearCache(): void {
    this.store.clearCache();
  }

  /**
   * Get the base directory
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Get the JSONL file path
   */
  getFilePath(): string {
    return this.store.getFilePath();
  }
}

/**
 * Factory function to create an EpisodicJsonlStore
 */
export function getEpisodicJsonlStore(
  options: EpisodicJsonlStoreOptions = {}
): EpisodicJsonlStore {
  return new EpisodicJsonlStore(options);
}
