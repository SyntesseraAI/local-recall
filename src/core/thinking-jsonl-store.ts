/**
 * Thinking JSONL Store
 *
 * High-level store for thinking memories using JSONL append-only format.
 * Wraps the generic JsonlStore with thinking-memory-specific logic.
 *
 * Thinking memories differ from episodic memories:
 * - No keywords field
 * - Content is structured as "## Thought" + "## Output" sections
 */

import path from 'node:path';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  type ThinkingMemory,
  type MemoryScope,
  type CreateThinkingMemoryInput,
  createThinkingMemoryInputSchema,
} from './types.js';
import {
  type ThinkingEntry,
  type ThinkingAddEntry,
  type DeleteEntry,
  type EmbeddingEntry,
  thinkingEntrySchema,
} from './jsonl-types.js';
import { JsonlStore } from './jsonl-store.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/** JSONL filename for thinking memories */
const THINKING_JSONL_FILENAME = 'thinking.jsonl';

/**
 * Compute SHA-256 hash of content (16-char prefix)
 */
function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Generate a subject from thinking content (first ~100 chars)
 */
function generateSubjectFromContent(content: string): string {
  // Extract the first line or meaningful portion
  const firstParagraph = content.split('\n').find((line) => line.trim().length > 0) ?? content;
  const cleaned = firstParagraph.replace(/^#+\s*/, '').trim(); // Remove markdown headers
  if (cleaned.length <= 100) {
    return cleaned;
  }
  return cleaned.slice(0, 97) + '...';
}

/**
 * Convert a thinking add entry to a ThinkingMemory object
 */
function entryToMemory(entry: ThinkingEntry): ThinkingMemory | null {
  if (entry.action !== 'add') {
    return null;
  }
  return {
    id: entry.id,
    subject: entry.subject,
    applies_to: entry.applies_to as MemoryScope,
    occurred_at: entry.occurred_at,
    content_hash: entry.content_hash,
    content: entry.content,
  };
}

/**
 * Thinking JSONL Store Options
 */
export interface ThinkingJsonlStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
}

/**
 * Thinking JSONL Store
 *
 * Provides CRUD operations for thinking memories using JSONL storage.
 */
export class ThinkingJsonlStore {
  private store: JsonlStore<ThinkingEntry, ThinkingMemory>;
  private baseDir: string;

  constructor(options: ThinkingJsonlStoreOptions = {}) {
    const config = getConfig();
    this.baseDir = options.baseDir ?? config.memoryDir;
    const filePath = path.join(this.baseDir, THINKING_JSONL_FILENAME);

    this.store = new JsonlStore<ThinkingEntry, ThinkingMemory>({
      filePath,
      entrySchema: thinkingEntrySchema,
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
   * Create a new thinking memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateThinkingMemoryInput): Promise<ThinkingMemory> {
    logger.memory.debug(`Creating thinking memory: "${input.subject}"`);
    const validated = createThinkingMemoryInputSchema.parse(input);

    const now = new Date().toISOString();
    const occurredAt = validated.occurred_at ?? now;
    const contentHash = computeContentHash(validated.content);

    // Check for existing duplicate
    const existing = await this.findDuplicate(occurredAt, contentHash);
    if (existing) {
      logger.memory.info(`Duplicate thinking memory found (${existing.id}), skipping creation`);
      return existing;
    }

    const id = uuidv4();

    // Generate subject if not provided or too long
    const subject =
      validated.subject.length <= 200
        ? validated.subject
        : generateSubjectFromContent(validated.content);

    const memory: ThinkingMemory = {
      id,
      subject,
      applies_to: validated.applies_to as MemoryScope,
      occurred_at: occurredAt,
      content_hash: contentHash,
      content: validated.content,
    };

    // Create add entry
    const entry: ThinkingAddEntry = {
      action: 'add',
      id: memory.id,
      subject: memory.subject,
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      timestamp: now,
    };

    await this.store.appendEntry(entry);
    logger.memory.info(`Created thinking memory ${id}: "${memory.subject.slice(0, 50)}..."`);
    return memory;
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<ThinkingMemory | null> {
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
    logger.memory.info(`Deleted thinking memory ${id}`);
    return true;
  }

  /**
   * List all memories with optional filtering
   */
  async listMemories(filter?: {
    scope?: MemoryScope;
    limit?: number;
    offset?: number;
  }): Promise<ThinkingMemory[]> {
    let memories = await this.store.listMemories();

    // Apply filters
    if (filter?.scope) {
      memories = memories.filter((m) => m.applies_to === filter.scope);
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
  async findDuplicate(occurredAt: string, contentHash: string): Promise<ThinkingMemory | null> {
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
      logger.memory.warn(`Cannot store embedding: thinking memory ${id} not found`);
      return;
    }

    const entry: EmbeddingEntry = {
      action: 'embedding',
      id,
      embedding,
      timestamp: new Date().toISOString(),
    };

    await this.store.appendEntry(entry);
    logger.memory.debug(`Stored embedding for thinking memory ${id}`);
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
  async getMemoriesNeedingEmbeddings(): Promise<ThinkingMemory[]> {
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
      (memory: ThinkingMemory): ThinkingEntry => ({
        action: 'add',
        id: memory.id,
        subject: memory.subject,
        applies_to: memory.applies_to,
        occurred_at: memory.occurred_at,
        content_hash: memory.content_hash,
        content: memory.content,
        timestamp: now,
      }),
      // Create embedding entry
      (id: string, embedding: number[]): ThinkingEntry => ({
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
 * Factory function to create a ThinkingJsonlStore
 */
export function getThinkingJsonlStore(
  options: ThinkingJsonlStoreOptions = {}
): ThinkingJsonlStore {
  return new ThinkingJsonlStore(options);
}
