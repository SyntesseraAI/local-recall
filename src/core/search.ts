import Fuse from 'fuse.js';
import {
  type Memory,
  type SearchResult,
  type SearchOptions,
  type MemoryScope,
} from './types.js';
import { IndexManager } from './index.js';
import { MemoryManager } from './memory.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * Search Engine - fuzzy search implementation for memories
 */
export class SearchEngine {
  private indexManager: IndexManager;
  private memoryManager: MemoryManager;

  constructor(indexManager?: IndexManager, memoryManager?: MemoryManager) {
    const config = getConfig();
    this.indexManager = indexManager ?? new IndexManager(config.memoryDir);
    this.memoryManager = memoryManager ?? new MemoryManager(config.memoryDir);
  }

  /**
   * Search memories by keywords using fuzzy matching
   */
  async searchByKeywords(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    logger.search.debug(`Searching by keywords: "${query}"`);
    const config = getConfig();
    const threshold = options.threshold ?? config.fuzzyThreshold;
    const limit = options.limit ?? 10;

    const index = await this.indexManager.getIndex();
    const allKeywords = Object.keys(index.keywords);

    // Configure Fuse for fuzzy matching
    const fuse = new Fuse(allKeywords, {
      threshold: 1 - threshold, // Fuse uses 0 = exact, 1 = match anything
      includeScore: true,
    });

    // Parse query into individual keywords
    const queryKeywords = query.toLowerCase().split(/\s+/).filter(Boolean);

    // Find matching keywords
    const matchedKeywordMap = new Map<string, number>();

    for (const queryKeyword of queryKeywords) {
      const results = fuse.search(queryKeyword);
      for (const result of results) {
        const keyword = result.item;
        const score = 1 - (result.score ?? 0);
        const existing = matchedKeywordMap.get(keyword) ?? 0;
        matchedKeywordMap.set(keyword, Math.max(existing, score));
      }
    }

    // Get memory IDs from matched keywords
    const memoryScores = new Map<string, { score: number; keywords: string[] }>();

    for (const [keyword, keywordScore] of matchedKeywordMap) {
      const memoryIds = index.keywords[keyword] ?? [];
      for (const memoryId of memoryIds) {
        const existing = memoryScores.get(memoryId);
        if (existing) {
          existing.score += keywordScore;
          existing.keywords.push(keyword);
        } else {
          memoryScores.set(memoryId, { score: keywordScore, keywords: [keyword] });
        }
      }
    }

    // Sort by score and get top results
    const sortedIds = [...memoryScores.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit);

    // Load full memories
    const results: SearchResult[] = [];

    for (const [memoryId, { score, keywords }] of sortedIds) {
      const memory = await this.memoryManager.getMemory(memoryId);
      if (memory) {
        // Apply scope filter if specified
        if (options.scope && memory.applies_to !== options.scope) {
          continue;
        }
        results.push({
          memory,
          score: score / queryKeywords.length, // Normalize score
          matchedKeywords: keywords,
        });
      }
    }

    // Sort by occurred_at descending (most recent first)
    results.sort((a, b) =>
      new Date(b.memory.occurred_at).getTime() - new Date(a.memory.occurred_at).getTime()
    );

    logger.search.info(`Keyword search found ${results.length} results for "${query}" (sorted by occurred_at desc)`);
    return results;
  }

  /**
   * Search memories by subject line
   */
  async searchBySubject(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    logger.search.debug(`Searching by subject: "${query}"`);
    const config = getConfig();
    const threshold = options.threshold ?? config.fuzzyThreshold;
    const limit = options.limit ?? 10;

    const memories = await this.memoryManager.listMemories({
      scope: options.scope,
    });

    const fuse = new Fuse(memories, {
      keys: ['subject'],
      threshold: 1 - threshold,
      includeScore: true,
    });

    const fuseResults = fuse.search(query);

    const results = fuseResults.slice(0, limit).map((result) => ({
      memory: result.item,
      score: 1 - (result.score ?? 0),
      matchedKeywords: [],
    }));

    // Sort by occurred_at descending (most recent first)
    results.sort((a, b) =>
      new Date(b.memory.occurred_at).getTime() - new Date(a.memory.occurred_at).getTime()
    );

    logger.search.info(`Subject search found ${results.length} results for "${query}" (sorted by occurred_at desc)`);
    return results;
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
