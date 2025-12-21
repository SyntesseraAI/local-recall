import {
  type ThinkingMemory,
  type CreateThinkingMemoryInput,
  type MemoryScope,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';
import { getThinkingVectorStore } from './thinking-vector-store.js';
import { ThinkingJsonlStore } from './thinking-jsonl-store.js';

/**
 * Generate a subject from thinking content (first ~100 chars, truncated at word boundary)
 */
export function generateSubjectFromContent(content: string, maxLength: number = 100): string {
  const cleaned = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find last word boundary before maxLength
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Thinking Memory Manager - handles CRUD operations for thinking memories
 *
 * Uses JSONL storage format with the ThinkingJsonlStore.
 * Integrates with ThinkingVectorStore for semantic search.
 */
export class ThinkingMemoryManager {
  private _baseDir: string;
  private store: ThinkingJsonlStore;

  constructor(baseDir?: string) {
    const config = getConfig();
    this._baseDir = baseDir ?? config.memoryDir;
    this.store = new ThinkingJsonlStore({ baseDir: this._baseDir });
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
   * Check if a thinking memory with the same occurred_at and content_hash already exists
   */
  async findDuplicate(occurredAt: string, contentHash: string): Promise<ThinkingMemory | null> {
    return this.store.findDuplicate(occurredAt, contentHash);
  }

  /**
   * Create a new thinking memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateThinkingMemoryInput): Promise<ThinkingMemory> {
    const memory = await this.store.createMemory(input);

    // Add to vector store for immediate searchability
    try {
      const vectorStore = getThinkingVectorStore({ baseDir: this._baseDir });
      await vectorStore.add(memory);
    } catch (error) {
      // Log but don't fail - vector store will sync on next startup
      logger.memory.warn(`Failed to add thinking memory to vector store: ${error}`);
    }

    return memory;
  }

  /**
   * Get a thinking memory by ID
   */
  async getMemory(id: string): Promise<ThinkingMemory | null> {
    return this.store.getMemory(id);
  }

  /**
   * List all thinking memories with optional filtering
   */
  async listMemories(filter?: {
    scope?: MemoryScope;
    limit?: number;
    offset?: number;
  }): Promise<ThinkingMemory[]> {
    return this.store.listMemories(filter);
  }

  /**
   * Delete a thinking memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    const deleted = await this.store.deleteMemory(id);

    if (deleted) {
      // Remove from vector store
      try {
        const vectorStore = getThinkingVectorStore({ baseDir: this._baseDir });
        await vectorStore.remove(id);
      } catch (error) {
        logger.memory.warn(`Failed to remove thinking memory from vector store: ${error}`);
      }
    }

    return deleted;
  }

  /**
   * Delete all thinking memories for a specific transcript
   * Used when reprocessing a transcript
   */
  async deleteMemoriesForTranscript(transcriptId: string): Promise<number> {
    // This would require storing transcript ID in memories
    // For now, we'll rely on the processed log to handle reprocessing
    logger.memory.debug(`deleteMemoriesForTranscript called for ${transcriptId} (not implemented)`);
    return 0;
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
  async getMemoriesNeedingEmbeddings(): Promise<ThinkingMemory[]> {
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
