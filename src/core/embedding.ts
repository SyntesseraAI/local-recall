/**
 * Embedding Service - generates vector embeddings using fastembed
 *
 * Uses the BAAI/bge-small-en-v1.5 model (384 dimensions) for semantic search.
 */

import { EmbeddingModel, FlagEmbedding } from 'fastembed';
import { logger } from '../utils/logger.js';

/** Embedding dimension for bge-small-en-v1.5 */
export const EMBEDDING_DIM = 384;

/**
 * Singleton embedding service
 */
export class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  private model: FlagEmbedding | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Initialize the embedding model (downloads on first use)
   */
  async initialize(): Promise<void> {
    if (this.model) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    logger.search.info('Loading embedding model: BGESmallENV15');
    const startTime = Date.now();

    try {
      this.model = await FlagEmbedding.init({
        model: EmbeddingModel.BGESmallENV15,
      });
      const elapsed = Date.now() - startTime;
      logger.search.info(`Embedding model loaded in ${elapsed}ms`);
    } catch (error) {
      logger.search.error(`Failed to load embedding model: ${error}`);
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.model !== null;
  }

  /**
   * Generate embedding for a query (optimized for search queries)
   */
  async embedQuery(text: string): Promise<number[]> {
    if (!this.model) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Embedding model not initialized');
    }

    const embedding = await this.model.queryEmbed(text);
    return Array.from(embedding);
  }

  /**
   * Generate embedding for a passage/document
   */
  async embed(text: string): Promise<number[]> {
    if (!this.model) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Embedding model not initialized');
    }

    // Use passageEmbed for documents, collect single result
    const embeddings: number[][] = [];
    for await (const batch of this.model.passageEmbed([text], 1)) {
      embeddings.push(...batch.map((e) => Array.from(e)));
    }

    const result = embeddings[0];
    if (!result) {
      throw new Error('No embedding generated');
    }

    return result;
  }

  /**
   * Generate embeddings for multiple passages (batch processing)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    if (!this.model) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('Embedding model not initialized');
    }

    const embeddings: number[][] = [];
    for await (const batch of this.model.passageEmbed(texts, 32)) {
      embeddings.push(...batch.map((e) => Array.from(e)));
    }

    return embeddings;
  }
}

/**
 * Get the singleton embedding service instance
 */
export function getEmbeddingService(): EmbeddingService {
  return EmbeddingService.getInstance();
}
