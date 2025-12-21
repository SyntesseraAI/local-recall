/**
 * Vector Store - manages vector embeddings using Orama for semantic search
 *
 * Uses Orama (pure JavaScript) instead of sqlite-vec to avoid native mutex issues
 * when multiple processes access the database concurrently.
 *
 * The index is persisted to a JSON file and loaded on startup.
 */

import { create, insert, remove, search, count } from '@orama/orama';
import { persist, restore } from '@orama/plugin-data-persistence';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { type Memory, type MemoryScope } from './types.js';
import { EmbeddingService, EMBEDDING_DIM, getEmbeddingService } from './embedding.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';
import type { EpisodicJsonlStore } from './episodic-jsonl-store.js';

import type { Orama, Results } from '@orama/orama';

/** Index filename for persistence */
const INDEX_FILENAME = 'orama-episodic-index.json';

/** Orama schema for episodic memories */
const EPISODIC_SCHEMA = {
  id: 'string',
  subject: 'string',
  keywords: 'string', // JSON stringified array
  applies_to: 'string',
  occurred_at: 'string',
  content_hash: 'string',
  content: 'string',
  embedding: `vector[${EMBEDDING_DIM}]`,
} as const;

type EpisodicDocument = {
  id: string;
  subject: string;
  keywords: string;
  applies_to: string;
  occurred_at: string;
  content_hash: string;
  content: string;
  embedding: number[];
};

export interface VectorStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
  /** Open in read-only mode (default: false) - skips persistence on changes */
  readonly?: boolean;
}

/**
 * Vector Store - manages vector embeddings using Orama
 *
 * Pure JavaScript implementation - no native dependencies, no mutex issues.
 */
export class VectorStore {
  private embeddingService: EmbeddingService;
  private indexPath: string;
  private baseDir: string;
  private readonly: boolean;
  private initialized: boolean = false;
  private db: Orama<typeof EPISODIC_SCHEMA> | null = null;
  private dirty: boolean = false;

  constructor(options: VectorStoreOptions = {}) {
    const config = getConfig();
    this.baseDir = options.baseDir ?? config.memoryDir;
    this.indexPath = path.join(this.baseDir, INDEX_FILENAME);
    this.embeddingService = getEmbeddingService();
    this.readonly = options.readonly ?? false;
  }

  /**
   * Initialize the store (loads existing index or creates new one)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.search.info(`Initializing Orama vector store (readonly=${this.readonly})`);

    // Ensure directory exists and gitignore is set up (only if not readonly)
    if (!this.readonly) {
      await fs.mkdir(this.baseDir, { recursive: true });
      await ensureGitignore(this.baseDir);
    }

    // Initialize embedding service
    await this.embeddingService.initialize();

    // Try to load existing index
    try {
      const indexData = await fs.readFile(this.indexPath, 'utf-8');
      this.db = await restore('json', indexData) as Orama<typeof EPISODIC_SCHEMA>;
      const docCount = await count(this.db);
      logger.search.info(`Loaded existing Orama index with ${docCount} documents`);
    } catch (error) {
      // Index doesn't exist or is corrupted, create new one
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.search.info('No existing index found, creating new Orama index');
      } else {
        logger.search.warn(`Failed to load index, creating new one: ${error}`);
      }

      this.db = await create({
        schema: EPISODIC_SCHEMA,
      });
    }

    this.initialized = true;
    logger.search.info('Orama vector store initialized');
  }

  /**
   * Persist the index to disk
   */
  private async persistIndex(): Promise<void> {
    if (this.readonly || !this.db || !this.dirty) {
      return;
    }

    try {
      const indexData = await persist(this.db, 'json');
      await fs.writeFile(this.indexPath, indexData as string, 'utf-8');
      this.dirty = false;
      logger.search.debug('Orama index persisted to disk');
    } catch (error) {
      logger.search.error(`Failed to persist Orama index: ${error}`);
    }
  }

  /**
   * Add a memory to the vector store (generates embedding if not provided)
   */
  async add(memory: Memory): Promise<void> {
    // Generate embedding
    const textForEmbedding = `${memory.subject}\n\n${memory.content}`;
    const embedding = await this.embeddingService.embed(textForEmbedding);
    await this.addWithEmbedding(memory, embedding);
  }

  /**
   * Add a memory with a pre-computed embedding
   */
  async addWithEmbedding(memory: Memory, embedding: number[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    logger.search.debug(`Adding memory to Orama store: ${memory.id}`);

    // Check if memory already exists by searching for its ID
    const existing = await search(this.db, {
      term: memory.id,
      properties: ['id'],
      limit: 1,
    });

    if (existing.hits.length > 0 && existing.hits[0]?.id === memory.id) {
      logger.search.debug(`Memory ${memory.id} already exists in vector store`);
      return;
    }

    // Insert into Orama with pre-computed embedding
    await insert(this.db, {
      id: memory.id,
      subject: memory.subject,
      keywords: JSON.stringify(memory.keywords),
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      embedding,
    });

    this.dirty = true;
    logger.search.info(`Added memory ${memory.id} to Orama store`);

    // Persist after each add (could be batched for performance)
    await this.persistIndex();
  }

  /**
   * Remove a memory from the vector store
   */
  async remove(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    try {
      await remove(this.db, id);
      this.dirty = true;
      logger.search.info(`Removed memory ${id} from Orama store`);
      await this.persistIndex();
      return true;
    } catch (error) {
      // Document might not exist
      logger.search.debug(`Failed to remove memory ${id}: ${error}`);
      return false;
    }
  }

  /**
   * Search for similar memories using vector similarity
   * Applies recency weighting to boost more recent memories
   */
  async search(
    query: string,
    options: { limit?: number; scope?: MemoryScope; recencyWeight?: number } = {}
  ): Promise<Array<{ memory: Memory; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    const limit = options.limit ?? 10;
    const recencyWeight = options.recencyWeight ?? 0.1; // 10% max boost for recency
    logger.search.debug(`Orama vector search for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embedQuery(query);

    // Build search parameters
    // Note: Set similarity to 0 to disable Orama's default threshold (~0.8)
    // We handle our own threshold filtering via config options
    const searchParams: Parameters<typeof search>[1] = {
      mode: 'vector',
      vector: {
        value: queryEmbedding,
        property: 'embedding',
      },
      similarity: 0, // Disable default threshold, we filter ourselves
      limit: options.scope ? limit * 10 : limit, // Get more results when filtering by scope
      includeVectors: false,
    };

    const results = await search(this.db, searchParams) as Results<EpisodicDocument>;

    // Find date range for recency calculation
    const now = Date.now();
    const timestamps = results.hits.map((hit) => new Date(hit.document.occurred_at).getTime());
    const oldestTime = Math.min(...timestamps);
    const timeRange = now - oldestTime;

    let mappedResults = results.hits.map((hit) => {
      const occurredAt = new Date(hit.document.occurred_at).getTime();
      // Calculate recency factor: 1.0 for now, 0.0 for oldest
      const recencyFactor = timeRange > 0 ? (occurredAt - oldestTime) / timeRange : 1;
      // Apply recency boost: similarity * (1 + recencyWeight * recencyFactor)
      const baseScore = hit.score;
      const boostedScore = baseScore * (1 + recencyWeight * recencyFactor);

      return {
        memory: {
          id: hit.document.id,
          subject: hit.document.subject,
          keywords: JSON.parse(hit.document.keywords) as string[],
          applies_to: hit.document.applies_to as MemoryScope,
          occurred_at: hit.document.occurred_at,
          content_hash: hit.document.content_hash,
          content: hit.document.content,
        },
        // Round to 2 decimal places
        score: Math.round(boostedScore * 100) / 100,
      };
    });

    // Sort by boosted score descending
    mappedResults.sort((a, b) => b.score - a.score);

    // Filter by scope if specified
    if (options.scope) {
      mappedResults = mappedResults.filter((r) => r.memory.applies_to === options.scope);
    }

    // Apply the original limit
    mappedResults = mappedResults.slice(0, limit);

    logger.search.info(`Orama vector search found ${mappedResults.length} results`);
    return mappedResults;
  }

  /**
   * Get all memory IDs currently in the store
   */
  async getStoredIds(): Promise<Set<string>> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Vector store not initialized');
    }

    // Search for all documents (empty term matches all)
    const allDocs = await search(this.db, {
      term: '',
      limit: 100000, // High limit to get all
    }) as Results<EpisodicDocument>;

    return new Set(allDocs.hits.map((hit) => hit.document.id));
  }

  /**
   * Sync vector store with file-based memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories: Memory[]): Promise<{ added: number; removed: number }> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.search.info(`Syncing Orama store with ${memories.length} memories`);

    const storedIds = await this.getStoredIds();
    const fileIds = new Set(memories.map((m) => m.id));

    let added = 0;
    let removed = 0;

    // Add memories that exist in files but not in store
    for (const memory of memories) {
      if (!storedIds.has(memory.id)) {
        await this.add(memory);
        added++;
      }
    }

    // Remove memories that exist in store but not in files
    for (const storedId of storedIds) {
      if (!fileIds.has(storedId)) {
        await this.remove(storedId);
        removed++;
      }
    }

    logger.search.info(`Sync complete: ${added} added, ${removed} removed`);
    return { added, removed };
  }

  /**
   * Sync vector store with JSONL store
   * Uses pre-computed embeddings from JSONL when available, generates new ones otherwise
   * Stores newly generated embeddings back to the JSONL store
   */
  async syncWithJsonlStore(
    jsonlStore: EpisodicJsonlStore
  ): Promise<{ added: number; removed: number; embeddingsGenerated: number }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const memories = await jsonlStore.listMemories();
    const storedEmbeddings = await jsonlStore.getAllEmbeddings();

    logger.search.info(
      `Syncing Orama store with JSONL (${memories.length} memories, ${storedEmbeddings.size} embeddings)`
    );

    const storedIds = await this.getStoredIds();
    const memoryIds = new Set(memories.map((m) => m.id));

    let added = 0;
    let removed = 0;
    let embeddingsGenerated = 0;

    // Add memories that exist in JSONL but not in store
    for (const memory of memories) {
      if (!storedIds.has(memory.id)) {
        // Check if we have a pre-computed embedding
        const embedding = storedEmbeddings.get(memory.id);

        if (embedding) {
          // Use pre-computed embedding
          await this.addWithEmbedding(memory, embedding);
        } else {
          // Generate new embedding and store it back
          const textForEmbedding = `${memory.subject}\n\n${memory.content}`;
          const newEmbedding = await this.embeddingService.embed(textForEmbedding);
          await this.addWithEmbedding(memory, newEmbedding);
          await jsonlStore.storeEmbedding(memory.id, newEmbedding);
          embeddingsGenerated++;
        }
        added++;
      }
    }

    // Remove memories that exist in store but not in JSONL
    for (const storedId of storedIds) {
      if (!memoryIds.has(storedId)) {
        await this.remove(storedId);
        removed++;
      }
    }

    logger.search.info(
      `JSONL sync complete: ${added} added, ${removed} removed, ${embeddingsGenerated} embeddings generated`
    );
    return { added, removed, embeddingsGenerated };
  }

  /**
   * Close the vector store (persists any pending changes)
   */
  async close(): Promise<void> {
    if (this.dirty) {
      await this.persistIndex();
    }
    logger.search.debug('Orama vector store closed');
  }
}

/**
 * Create a new vector store instance
 */
export function getVectorStore(options: VectorStoreOptions = {}): VectorStore {
  const baseDir = typeof options === 'string' ? options : options.baseDir;
  const readonly = typeof options === 'string' ? false : (options.readonly ?? false);

  return new VectorStore({ baseDir, readonly });
}

/**
 * Reset the vector store (no-op since there's no singleton)
 * Kept for API compatibility with tests
 */
export function resetVectorStore(): void {
  logger.search.debug('resetVectorStore called (no-op)');
}
