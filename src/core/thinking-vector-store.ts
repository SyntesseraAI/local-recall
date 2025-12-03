/**
 * Thinking Vector Store - manages vector embeddings for thinking memories using Orama
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
import { type ThinkingMemory, type MemoryScope } from './types.js';
import { EmbeddingService, EMBEDDING_DIM, getEmbeddingService } from './embedding.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';

import type { Orama, Results } from '@orama/orama';

/** Index filename for persistence */
const INDEX_FILENAME = 'orama-thinking-index.json';

/** Orama schema for thinking memories */
const THINKING_SCHEMA = {
  id: 'string',
  subject: 'string',
  applies_to: 'string',
  occurred_at: 'string',
  content_hash: 'string',
  content: 'string',
  embedding: `vector[${EMBEDDING_DIM}]`,
} as const;

type ThinkingDocument = {
  id: string;
  subject: string;
  applies_to: string;
  occurred_at: string;
  content_hash: string;
  content: string;
  embedding: number[];
};

export interface ThinkingVectorStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
  /** Open in read-only mode (default: false) - skips persistence on changes */
  readonly?: boolean;
}

/**
 * Thinking Vector Store - manages vector embeddings for thinking memories using Orama
 *
 * Pure JavaScript implementation - no native dependencies, no mutex issues.
 */
export class ThinkingVectorStore {
  private embeddingService: EmbeddingService;
  private indexPath: string;
  private baseDir: string;
  private readonly: boolean;
  private initialized: boolean = false;
  private db: Orama<typeof THINKING_SCHEMA> | null = null;
  private dirty: boolean = false;

  constructor(options: ThinkingVectorStoreOptions = {}) {
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

    logger.search.info(`Initializing Orama thinking vector store (readonly=${this.readonly})`);

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
      this.db = await restore('json', indexData) as Orama<typeof THINKING_SCHEMA>;
      const docCount = await count(this.db);
      logger.search.info(`Loaded existing Orama thinking index with ${docCount} documents`);
    } catch (error) {
      // Index doesn't exist or is corrupted, create new one
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.search.info('No existing thinking index found, creating new Orama index');
      } else {
        logger.search.warn(`Failed to load thinking index, creating new one: ${error}`);
      }

      this.db = await create({
        schema: THINKING_SCHEMA,
      });
    }

    this.initialized = true;
    logger.search.info('Orama thinking vector store initialized');
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
      logger.search.debug('Orama thinking index persisted to disk');
    } catch (error) {
      logger.search.error(`Failed to persist Orama thinking index: ${error}`);
    }
  }

  /**
   * Add a thinking memory to the vector store
   */
  async add(memory: ThinkingMemory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Thinking vector store not initialized');
    }

    logger.search.debug(`Adding thinking memory to Orama store: ${memory.id}`);

    // Check if memory already exists by searching for its ID
    const existing = await search(this.db, {
      term: memory.id,
      properties: ['id'],
      limit: 1,
    });

    if (existing.hits.length > 0 && existing.hits[0]?.id === memory.id) {
      logger.search.debug(`Thinking memory ${memory.id} already exists in vector store`);
      return;
    }

    // Generate embedding
    const textForEmbedding = `${memory.subject}\n\n${memory.content}`;
    const embedding = await this.embeddingService.embed(textForEmbedding);

    // Insert into Orama
    await insert(this.db, {
      id: memory.id,
      subject: memory.subject,
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      embedding,
    });

    this.dirty = true;
    logger.search.info(`Added thinking memory ${memory.id} to Orama store`);

    // Persist after each add (could be batched for performance)
    await this.persistIndex();
  }

  /**
   * Remove a thinking memory from the vector store
   */
  async remove(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Thinking vector store not initialized');
    }

    try {
      await remove(this.db, id);
      this.dirty = true;
      logger.search.info(`Removed thinking memory ${id} from Orama store`);
      await this.persistIndex();
      return true;
    } catch (error) {
      // Document might not exist
      logger.search.debug(`Failed to remove thinking memory ${id}: ${error}`);
      return false;
    }
  }

  /**
   * Search for similar thinking memories using vector similarity
   */
  async search(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {}
  ): Promise<Array<{ memory: ThinkingMemory; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Thinking vector store not initialized');
    }

    const limit = options.limit ?? 10;
    logger.search.debug(`Orama thinking vector search for: "${query}"`);

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

    const results = await search(this.db, searchParams) as Results<ThinkingDocument>;

    let mappedResults = results.hits.map((hit) => ({
      memory: {
        id: hit.document.id,
        subject: hit.document.subject,
        applies_to: hit.document.applies_to as MemoryScope,
        occurred_at: hit.document.occurred_at,
        content_hash: hit.document.content_hash,
        content: hit.document.content,
      },
      // Orama returns similarity score (higher is better, 0-1 range)
      score: Math.round(hit.score * 100) / 100,
    }));

    // Sort by score descending, then by recency for equivalent scores
    mappedResults.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // For equal scores, prefer more recent memories
      return new Date(b.memory.occurred_at).getTime() - new Date(a.memory.occurred_at).getTime();
    });

    // Filter by scope if specified
    if (options.scope) {
      mappedResults = mappedResults.filter((r) => r.memory.applies_to === options.scope);
    }

    // Apply the original limit
    mappedResults = mappedResults.slice(0, limit);

    logger.search.info(`Orama thinking vector search found ${mappedResults.length} results`);
    return mappedResults;
  }

  /**
   * Get all thinking memory IDs currently in the store
   */
  async getStoredIds(): Promise<Set<string>> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Thinking vector store not initialized');
    }

    // Search for all documents (empty term matches all)
    const allDocs = await search(this.db, {
      term: '',
      limit: 100000, // High limit to get all
    }) as Results<ThinkingDocument>;

    return new Set(allDocs.hits.map((hit) => hit.document.id));
  }

  /**
   * Sync vector store with file-based thinking memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories: ThinkingMemory[]): Promise<{ added: number; removed: number }> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.search.info(`Syncing Orama thinking store with ${memories.length} thinking memories`);

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

    logger.search.info(`Thinking sync complete: ${added} added, ${removed} removed`);
    return { added, removed };
  }

  /**
   * Close the vector store (persists any pending changes)
   */
  async close(): Promise<void> {
    if (this.dirty) {
      await this.persistIndex();
    }
    logger.search.debug('Orama thinking vector store closed');
  }
}

/**
 * Create a new thinking vector store instance
 */
export function getThinkingVectorStore(options: ThinkingVectorStoreOptions = {}): ThinkingVectorStore {
  const baseDir = typeof options === 'string' ? options : options.baseDir;
  const readonly = typeof options === 'string' ? false : (options.readonly ?? false);

  return new ThinkingVectorStore({ baseDir, readonly });
}

/**
 * Reset the thinking vector store (no-op since there's no singleton)
 * Kept for API compatibility with tests
 */
export function resetThinkingVectorStore(): void {
  logger.search.debug('resetThinkingVectorStore called (no-op)');
}
