/**
 * Embedding Service - generates vector embeddings using Ollama
 *
 * Uses nomic-embed-text model (768 dimensions) via Ollama HTTP API.
 * Ollama handles concurrency properly as a separate server process.
 */

import { logger } from '../utils/logger.js';

/** Ollama API endpoint */
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

/** Embedding model - nomic-embed-text is fast, small (~274MB), and high quality */
const EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text';

/** Embedding dimension for nomic-embed-text */
export const EMBEDDING_DIM = 768;

interface OllamaEmbedResponse {
  embeddings: number[][];
}

/**
 * Singleton embedding service using Ollama
 */
export class EmbeddingService {
  private static instance: EmbeddingService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Initialize the embedding service (checks Ollama is available)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.search.info(`Initializing Ollama embedding service (model: ${EMBEDDING_MODEL})`);
    const startTime = Date.now();

    // Check Ollama is running
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama not responding: ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Ollama not available at ${OLLAMA_BASE_URL}. ` +
        `Please start Ollama and ensure ${EMBEDDING_MODEL} is pulled: ollama pull ${EMBEDDING_MODEL}`
      );
    }

    // Warm up the model with a test embedding
    await this.embed('test');

    const elapsed = Date.now() - startTime;
    logger.search.info(`Ollama embedding service ready in ${elapsed}ms`);
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate embedding for a query
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.embed(text);
  }

  /**
   * Generate embedding for a passage/document
   */
  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama embed failed: ${response.status} - ${error}`);
    }

    const data = await response.json() as OllamaEmbedResponse;
    const embedding = data.embeddings[0];

    if (!embedding) {
      throw new Error('No embedding returned from Ollama');
    }

    return embedding;
  }

  /**
   * Generate embeddings for multiple passages (batch processing)
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    // Ollama's embed API supports batching via array input
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama batch embed failed: ${response.status} - ${error}`);
    }

    const data = await response.json() as OllamaEmbedResponse;
    return data.embeddings;
  }
}

/**
 * Get the singleton embedding service instance
 */
export function getEmbeddingService(): EmbeddingService {
  return EmbeddingService.getInstance();
}
