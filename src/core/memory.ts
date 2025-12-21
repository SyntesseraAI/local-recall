import {
  type Memory,
  type CreateMemoryInput,
  type MemoryScope,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';
import { getVectorStore } from './vector-store.js';
import { EpisodicJsonlStore } from './episodic-jsonl-store.js';

/**
 * Memory Manager - handles CRUD operations for episodic memories
 *
 * Uses JSONL storage format with the EpisodicJsonlStore.
 * Integrates with VectorStore for semantic search.
 */
export class MemoryManager {
  private _baseDir: string;
  private store: EpisodicJsonlStore;

  constructor(baseDir?: string) {
    const config = getConfig();
    this._baseDir = baseDir ?? config.memoryDir;
    this.store = new EpisodicJsonlStore({ baseDir: this._baseDir });
  }

  /**
   * Get the base directory used by this manager
   */
  get baseDir(): string {
    return this._baseDir;
  }

  /**
   * Initialize the manager (ensures directory and gitignore exist)
   */
  async initialize(): Promise<void> {
    await ensureGitignore(this._baseDir);
    await this.store.initialize();
  }

  /**
   * Check if a memory with the same occurred_at and content_hash already exists
   */
  async findDuplicate(occurredAt: string, contentHash: string): Promise<Memory | null> {
    return this.store.findDuplicate(occurredAt, contentHash);
  }

  /**
   * Create a new memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    const memory = await this.store.createMemory(input);

    // Add to vector store for immediate searchability
    try {
      const vectorStore = getVectorStore({ baseDir: this._baseDir });
      await vectorStore.add(memory);
    } catch (error) {
      // Log but don't fail - vector store will sync on next startup
      logger.memory.warn(`Failed to add memory to vector store: ${error}`);
    }

    return memory;
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    return this.store.getMemory(id);
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
    return this.store.listMemories(filter);
  }

  /**
   * Delete a memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    const deleted = await this.store.deleteMemory(id);

    if (deleted) {
      // Remove from vector store
      try {
        const vectorStore = getVectorStore({ baseDir: this._baseDir });
        await vectorStore.remove(id);
      } catch (error) {
        logger.memory.warn(`Failed to remove memory from vector store: ${error}`);
      }
    }

    return deleted;
  }

  /**
   * Store an embedding for a memory in the JSONL file
   */
  async storeEmbedding(id: string, embedding: number[]): Promise<void> {
    await this.store.storeEmbedding(id, embedding);
  }

  /**
   * Get embedding for a memory from the JSONL file
   */
  async getEmbedding(id: string): Promise<number[] | null> {
    return this.store.getEmbedding(id);
  }

  /**
   * Get all embeddings from the JSONL file
   */
  async getAllEmbeddings(): Promise<Map<string, number[]>> {
    return this.store.getAllEmbeddings();
  }

  /**
   * Get memories that don't have embeddings yet
   */
  async getMemoriesNeedingEmbeddings(): Promise<Memory[]> {
    return this.store.getMemoriesNeedingEmbeddings();
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
    return this.store.needsCompaction();
  }

  /**
   * Compact the JSONL file
   */
  async compact(): Promise<{ originalLines: number; newLines: number }> {
    return this.store.compact();
  }

  /**
   * Clear the in-memory cache (forces reload on next access)
   */
  clearCache(): void {
    this.store.clearCache();
  }

  /**
   * Get the JSONL file path
   */
  getFilePath(): string {
    return this.store.getFilePath();
  }
}
