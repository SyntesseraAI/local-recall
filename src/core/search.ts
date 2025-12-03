import {
  type Memory,
  type SearchResult,
  type SearchOptions,
  type MemoryScope,
} from './types.js';
import { MemoryManager } from './memory.js';
import { getVectorStore } from './vector-store.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export interface SearchEngineOptions {
  /** Memory manager instance */
  memoryManager?: MemoryManager;
  /** Open vector store in read-only mode (default: false) - avoids write locks */
  readonly?: boolean;
  /** Base directory for memory storage (defaults to config.memoryDir) */
  baseDir?: string;
}

/**
 * Search Engine - vector-based semantic search for memories
 */
export class SearchEngine {
  private memoryManager: MemoryManager;
  private readonly: boolean;
  private baseDir: string;

  constructor(options: SearchEngineOptions | MemoryManager = {}) {
    const config = getConfig();
    // Support legacy constructor (passing MemoryManager directly)
    if (options instanceof MemoryManager) {
      this.memoryManager = options;
      this.readonly = false;
      // Use the MemoryManager's baseDir to ensure consistency
      this.baseDir = options.baseDir;
    } else {
      this.memoryManager = options.memoryManager ?? new MemoryManager(config.memoryDir);
      this.readonly = options.readonly ?? false;
      // Use the baseDir from options, or from the memoryManager if available
      this.baseDir = options.baseDir ?? this.memoryManager.baseDir;
    }
  }

  /**
   * Search memories using vector similarity
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    logger.search.debug(`Vector search: "${query}"`);
    const limit = options.limit ?? 10;

    const vectorStore = getVectorStore({ baseDir: this.baseDir, readonly: this.readonly });
    const results = await vectorStore.search(query, {
      limit,
      scope: options.scope,
    });

    // Convert to SearchResult format
    const searchResults: SearchResult[] = results.map((r) => ({
      memory: r.memory,
      score: r.score,
      matchedKeywords: [], // Vector search doesn't use keywords
    }));

    logger.search.info(`Vector search found ${searchResults.length} results for "${query}"`);
    return searchResults;
  }

  /**
   * @deprecated Use search() instead. Kept for backwards compatibility.
   */
  async searchByKeywords(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    return this.search(query, options);
  }

  /**
   * @deprecated Use search() instead. Kept for backwards compatibility.
   */
  async searchBySubject(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    return this.search(query, options);
  }

  /**
   * Search memories by scope
   */
  async searchByScope(scope: MemoryScope): Promise<Memory[]> {
    return this.memoryManager.listMemories({ scope });
  }

  /**
   * Get relevant memories for a session start
   * Combines recent and highly-connected memories
   */
  async getRelevantForSession(context?: {
    files?: string[];
    area?: string;
  }): Promise<Memory[]> {
    logger.search.debug('Getting relevant memories for session');
    const config = getConfig();
    const limit = config.hooks.maxContextMemories;

    const memories: Memory[] = [];
    const seenIds = new Set<string>();

    // Get file-specific memories if files provided
    if (context?.files) {
      for (const file of context.files) {
        const fileMemories = await this.searchByScope(`file:${file}`);
        for (const memory of fileMemories) {
          if (!seenIds.has(memory.id)) {
            seenIds.add(memory.id);
            memories.push(memory);
          }
        }
      }
    }

    // Get area-specific memories if area provided
    if (context?.area) {
      const areaMemories = await this.searchByScope(`area:${context.area}`);
      for (const memory of areaMemories) {
        if (!seenIds.has(memory.id)) {
          seenIds.add(memory.id);
          memories.push(memory);
        }
      }
    }

    // Fill remaining slots with global memories (most recent)
    if (memories.length < limit) {
      const globalMemories = await this.memoryManager.listMemories({
        scope: 'global',
        limit: limit - memories.length,
      });
      for (const memory of globalMemories) {
        if (!seenIds.has(memory.id)) {
          seenIds.add(memory.id);
          memories.push(memory);
        }
      }
    }

    // Still need more? Get recent memories regardless of scope
    if (memories.length < limit) {
      const recentMemories = await this.memoryManager.listMemories({
        limit: limit - memories.length,
      });
      for (const memory of recentMemories) {
        if (!seenIds.has(memory.id)) {
          seenIds.add(memory.id);
          memories.push(memory);
        }
      }
    }

    const result = memories.slice(0, limit);
    logger.search.info(`Found ${result.length} relevant memories for session`);
    return result;
  }
}
