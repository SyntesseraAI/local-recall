import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  type MemoryIndex,
  type MemoryIndexEntry,
  type MemoryScope,
  memoryFrontmatterSchema,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { parseMarkdown } from '../utils/markdown.js';
import { ensureGitignore } from '../utils/gitignore.js';

const INDEX_VERSION = 1;

/**
 * Index Manager - maintains the keyword index for fast lookups
 */
export class IndexManager {
  private baseDir: string;
  private indexPath: string;
  private memoriesDir: string;
  private cachedIndex: MemoryIndex | null = null;
  private cacheTime: number = 0;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.indexPath = path.join(this.baseDir, 'index.json');
    this.memoriesDir = path.join(this.baseDir, 'memories');
  }

  /**
   * Build or rebuild the index from all memory files
   */
  async buildIndex(): Promise<MemoryIndex> {
    logger.index.info('Building memory index');
    await this.ensureDir();

    const index: MemoryIndex = {
      version: INDEX_VERSION,
      built_at: new Date().toISOString(),
      keywords: {},
      memories: {},
    };

    try {
      const files = await fs.readdir(this.memoriesDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));
      logger.index.debug(`Found ${mdFiles.length} memory files to index`);

      for (const file of mdFiles) {
        const filePath = path.join(this.memoriesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const entry = this.parseMemoryForIndex(content);

        if (entry) {
          // Add to memories map
          index.memories[entry.id] = entry;

          // Add to keyword index
          for (const keyword of entry.keywords) {
            const normalizedKeyword = keyword.toLowerCase();
            if (!index.keywords[normalizedKeyword]) {
              index.keywords[normalizedKeyword] = [];
            }
            index.keywords[normalizedKeyword].push(entry.id);
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.index.error(`Failed to build index: ${String(error)}`);
        throw error;
      }
      // Directory doesn't exist yet, return empty index
      logger.index.debug('Memories directory does not exist yet');
    }

    // Save index to disk
    await this.saveIndex(index);
    this.cachedIndex = index;
    this.cacheTime = Date.now();

    const memoryCount = Object.keys(index.memories).length;
    const keywordCount = Object.keys(index.keywords).length;
    logger.index.info(`Index built: ${memoryCount} memories, ${keywordCount} keywords`);

    return index;
  }

  /**
   * Get the current index, loading from disk or cache
   */
  async getIndex(): Promise<MemoryIndex> {
    const config = getConfig();
    const cacheAge = (Date.now() - this.cacheTime) / 1000;

    // Always ensure .gitignore exists
    await ensureGitignore(this.baseDir);

    // Return cached index if still fresh
    if (this.cachedIndex && cacheAge < config.indexRefreshInterval) {
      logger.index.debug('Using cached index');
      return this.cachedIndex;
    }

    // Try to load from disk
    try {
      logger.index.debug('Loading index from disk');
      const content = await fs.readFile(this.indexPath, 'utf-8');
      const index = JSON.parse(content) as MemoryIndex;

      // Validate version
      if (index.version !== INDEX_VERSION) {
        logger.index.info('Index version mismatch, rebuilding');
        return this.buildIndex();
      }

      this.cachedIndex = index;
      this.cacheTime = Date.now();
      logger.index.debug('Index loaded from disk');
      return index;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Index doesn't exist, build it
        logger.index.info('Index file not found, building new index');
        return this.buildIndex();
      }
      logger.index.error(`Failed to load index: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Refresh the index (alias for buildIndex)
   */
  async refreshIndex(): Promise<MemoryIndex> {
    return this.buildIndex();
  }

  /**
   * Get memory IDs by keyword
   */
  async getMemoryIdsByKeyword(keyword: string): Promise<string[]> {
    const index = await this.getIndex();
    const normalizedKeyword = keyword.toLowerCase();
    return index.keywords[normalizedKeyword] ?? [];
  }

  /**
   * Get all unique keywords
   */
  async getAllKeywords(): Promise<string[]> {
    const index = await this.getIndex();
    return Object.keys(index.keywords);
  }

  /**
   * Get index entry for a memory
   */
  async getMemoryEntry(id: string): Promise<MemoryIndexEntry | null> {
    const index = await this.getIndex();
    return index.memories[id] ?? null;
  }

  /**
   * Get statistics about the index
   */
  async getStats(): Promise<{
    memoriesIndexed: number;
    keywordsIndexed: number;
    builtAt: string;
  }> {
    const index = await this.getIndex();
    return {
      memoriesIndexed: Object.keys(index.memories).length,
      keywordsIndexed: Object.keys(index.keywords).length,
      builtAt: index.built_at,
    };
  }

  /**
   * Ensure the base directory exists and has proper .gitignore
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.memoriesDir, { recursive: true });
    await ensureGitignore(this.baseDir);
  }

  /**
   * Save index to disk
   */
  private async saveIndex(index: MemoryIndex): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const tempPath = `${this.indexPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(index, null, 2), 'utf-8');
    await fs.rename(tempPath, this.indexPath);
  }

  /**
   * Parse a memory file for indexing using the markdown utility
   */
  private parseMemoryForIndex(content: string): MemoryIndexEntry | null {
    try {
      const { frontmatter } = parseMarkdown(content);
      const validated = memoryFrontmatterSchema.parse(frontmatter);

      return {
        id: validated.id,
        subject: validated.subject,
        keywords: validated.keywords,
        applies_to: validated.applies_to as MemoryScope,
        occurred_at: validated.occurred_at,
        content_hash: validated.content_hash,
      };
    } catch {
      return null;
    }
  }
}
