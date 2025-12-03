import {
  type ThinkingMemory,
  type ThinkingSearchResult,
  type MemoryScope,
} from './types.js';
import { ThinkingMemoryManager } from './thinking-memory.js';
import { getThinkingVectorStore } from './thinking-vector-store.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Search options for thinking memories
 */
export interface ThinkingSearchOptions {
  limit?: number;
  scope?: MemoryScope;
}

export interface ThinkingSearchEngineOptions {
  /** Memory manager instance */
  memoryManager?: ThinkingMemoryManager;
  /** Open vector store in read-only mode (default: false) - avoids write locks */
  readonly?: boolean;
}

/**
 * Thinking Search Engine - vector-based semantic search for thinking memories
 */
export class ThinkingSearchEngine {
  private memoryManager: ThinkingMemoryManager;
  private readonly: boolean;

  constructor(options: ThinkingSearchEngineOptions | ThinkingMemoryManager = {}) {
    const config = getConfig();
    // Support legacy constructor (passing ThinkingMemoryManager directly)
    if (options instanceof ThinkingMemoryManager) {
      this.memoryManager = options;
      this.readonly = false;
    } else {
      this.memoryManager = options.memoryManager ?? new ThinkingMemoryManager(config.memoryDir);
      this.readonly = options.readonly ?? false;
    }
  }

  /**
   * Search thinking memories using vector similarity
   */
  async search(
    query: string,
    options: ThinkingSearchOptions = {}
  ): Promise<ThinkingSearchResult[]> {
    logger.search.debug(`Thinking vector search: "${query}"`);
    const limit = options.limit ?? 10;

    const vectorStore = getThinkingVectorStore({ readonly: this.readonly });
    const results = await vectorStore.search(query, {
      limit,
      scope: options.scope,
    });

    // Convert to ThinkingSearchResult format
    const searchResults: ThinkingSearchResult[] = results.map((r) => ({
      memory: r.memory,
      score: r.score,
    }));

    logger.search.info(`Thinking vector search found ${searchResults.length} results for "${query}"`);
    return searchResults;
  }

  /**
   * Search thinking memories by scope
   */
  async searchByScope(scope: MemoryScope): Promise<ThinkingMemory[]> {
    return this.memoryManager.listMemories({ scope });
  }

  /**
   * Get recent thinking memories for a session
   */
  async getRecentThoughts(limit: number = 5): Promise<ThinkingMemory[]> {
    return this.memoryManager.listMemories({ limit });
  }
}
