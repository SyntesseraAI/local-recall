/**
 * Migration Service
 *
 * Handles migration from markdown file storage to JSONL format.
 * - Reads markdown files from episodic-memory/ and thinking-memory/ folders
 * - Creates entries in JSONL stores (which now live in the same folders)
 * - Deletes markdown files after successful migration
 * - Deletes Orama index files to force a rebuild with fresh embeddings
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { parseMarkdown } from '../utils/markdown.js';
import { memoryFrontmatterSchema, thinkingMemoryFrontmatterSchema } from './types.js';
import { EpisodicJsonlStore } from './episodic-jsonl-store.js';
import { ThinkingJsonlStore } from './thinking-jsonl-store.js';

/** Orama index filenames */
const ORAMA_EPISODIC_INDEX = 'orama-episodic-index.json';
const ORAMA_THINKING_INDEX = 'orama-thinking-index.json';

/**
 * Result of migration operation
 */
export interface MigrationResult {
  episodic: {
    migrated: number;
    deleted: number;
    errors: string[];
  };
  thinking: {
    migrated: number;
    deleted: number;
    errors: string[];
  };
  oramaIndexesDeleted: boolean;
}

/**
 * Migration status for checking if migration is needed
 */
export interface MigrationStatus {
  episodicNeedsMigration: boolean;
  thinkingNeedsMigration: boolean;
  episodicMarkdownCount: number;
  thinkingMarkdownCount: number;
}

/**
 * Migration Service
 *
 * Handles the one-time migration from markdown file storage to JSONL format.
 * After migration, markdown files are deleted and Orama indexes are cleared
 * so they can be rebuilt with fresh embeddings.
 */
export class MigrationService {
  private baseDir: string;
  private episodicDir: string;
  private thinkingDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.episodicDir = path.join(this.baseDir, 'episodic-memory');
    this.thinkingDir = path.join(this.baseDir, 'thinking-memory');
  }

  /**
   * Check if a path exists
   */
  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all markdown files in a directory
   */
  private async getMarkdownFiles(dir: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith('.md'));
    } catch {
      return [];
    }
  }

  /**
   * Check if any JSONL files exist in a directory
   */
  private async hasJsonlFiles(dir: string): Promise<boolean> {
    try {
      const files = await fs.readdir(dir);
      return files.some((f) => f.match(/^(episodic|thinking)-\d{6}\.jsonl$/));
    } catch {
      return false;
    }
  }

  /**
   * Check if migration is needed
   *
   * Migration is needed when:
   * - Markdown files exist in the memory directory
   * - No JSONL files exist yet (or we want to re-migrate)
   */
  async checkMigrationStatus(): Promise<MigrationStatus> {
    const episodicMdFiles = await this.getMarkdownFiles(this.episodicDir);
    const thinkingMdFiles = await this.getMarkdownFiles(this.thinkingDir);

    const episodicHasJsonl = await this.hasJsonlFiles(this.episodicDir);
    const thinkingHasJsonl = await this.hasJsonlFiles(this.thinkingDir);

    return {
      // Need migration if we have markdown files and no JSONL files
      episodicNeedsMigration: episodicMdFiles.length > 0 && !episodicHasJsonl,
      thinkingNeedsMigration: thinkingMdFiles.length > 0 && !thinkingHasJsonl,
      episodicMarkdownCount: episodicMdFiles.length,
      thinkingMarkdownCount: thinkingMdFiles.length,
    };
  }

  /**
   * Migrate episodic memories from markdown to JSONL
   * Uses the EpisodicJsonlStore which creates files in episodic-memory/
   */
  async migrateEpisodicMemories(): Promise<{ migrated: number; deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;
    let deleted = 0;

    const mdFiles = await this.getMarkdownFiles(this.episodicDir);

    if (mdFiles.length === 0) {
      logger.memory.info('No episodic markdown files to migrate');
      return { migrated: 0, deleted: 0, errors: [] };
    }

    logger.memory.info(`Migrating ${mdFiles.length} episodic memories from markdown to JSONL`);

    // Create JSONL store (will write to episodic-memory/ folder)
    const store = new EpisodicJsonlStore({ baseDir: this.baseDir });
    await store.initialize();

    for (const file of mdFiles) {
      const filePath = path.join(this.episodicDir, file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { frontmatter, body } = parseMarkdown(content);

        // Validate frontmatter
        const validated = memoryFrontmatterSchema.parse(frontmatter);

        // Create memory using the store (handles deduplication)
        await store.createMemory({
          subject: validated.subject,
          keywords: validated.keywords,
          applies_to: validated.applies_to,
          content: body,
          occurred_at: validated.occurred_at,
        });

        migrated++;

        // Delete the markdown file after successful migration
        try {
          await fs.unlink(filePath);
          deleted++;
          logger.memory.debug(`Deleted migrated file: ${file}`);
        } catch (deleteError) {
          logger.memory.warn(`Failed to delete ${file}: ${deleteError}`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate ${file}: ${error}`;
        errors.push(errorMsg);
        logger.memory.warn(errorMsg);
      }
    }

    logger.memory.info(
      `Migrated ${migrated}/${mdFiles.length} episodic memories, deleted ${deleted} markdown files`
    );

    return { migrated, deleted, errors };
  }

  /**
   * Migrate thinking memories from markdown to JSONL
   * Uses the ThinkingJsonlStore which creates files in thinking-memory/
   */
  async migrateThinkingMemories(): Promise<{ migrated: number; deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;
    let deleted = 0;

    const mdFiles = await this.getMarkdownFiles(this.thinkingDir);

    if (mdFiles.length === 0) {
      logger.memory.info('No thinking markdown files to migrate');
      return { migrated: 0, deleted: 0, errors: [] };
    }

    logger.memory.info(`Migrating ${mdFiles.length} thinking memories from markdown to JSONL`);

    // Create JSONL store (will write to thinking-memory/ folder)
    const store = new ThinkingJsonlStore({ baseDir: this.baseDir });
    await store.initialize();

    for (const file of mdFiles) {
      const filePath = path.join(this.thinkingDir, file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { frontmatter, body } = parseMarkdown(content);

        // Validate frontmatter
        const validated = thinkingMemoryFrontmatterSchema.parse(frontmatter);

        // Create memory using the store (handles deduplication)
        await store.createMemory({
          subject: validated.subject,
          applies_to: validated.applies_to,
          content: body,
          occurred_at: validated.occurred_at,
        });

        migrated++;

        // Delete the markdown file after successful migration
        try {
          await fs.unlink(filePath);
          deleted++;
          logger.memory.debug(`Deleted migrated file: ${file}`);
        } catch (deleteError) {
          logger.memory.warn(`Failed to delete ${file}: ${deleteError}`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate ${file}: ${error}`;
        errors.push(errorMsg);
        logger.memory.warn(errorMsg);
      }
    }

    logger.memory.info(
      `Migrated ${migrated}/${mdFiles.length} thinking memories, deleted ${deleted} markdown files`
    );

    return { migrated, deleted, errors };
  }

  /**
   * Delete Orama index files to force a rebuild
   * This ensures embeddings are regenerated after migration
   */
  async deleteOramaIndexes(): Promise<boolean> {
    let deleted = false;

    const episodicIndexPath = path.join(this.baseDir, ORAMA_EPISODIC_INDEX);
    const thinkingIndexPath = path.join(this.baseDir, ORAMA_THINKING_INDEX);

    for (const indexPath of [episodicIndexPath, thinkingIndexPath]) {
      if (await this.exists(indexPath)) {
        try {
          await fs.unlink(indexPath);
          logger.memory.info(`Deleted Orama index: ${path.basename(indexPath)}`);
          deleted = true;
        } catch (error) {
          logger.memory.warn(`Failed to delete Orama index ${indexPath}: ${error}`);
        }
      }
    }

    return deleted;
  }

  /**
   * Run full migration process
   *
   * 1. Check if migration is needed
   * 2. Migrate memories to JSONL (using stores)
   * 3. Delete markdown files after successful migration
   * 4. Delete Orama indexes to force rebuild
   */
  async runFullMigration(): Promise<MigrationResult> {
    const status = await this.checkMigrationStatus();

    const result: MigrationResult = {
      episodic: { migrated: 0, deleted: 0, errors: [] },
      thinking: { migrated: 0, deleted: 0, errors: [] },
      oramaIndexesDeleted: false,
    };

    // Migrate episodic memories if needed
    if (status.episodicNeedsMigration) {
      logger.memory.info('Starting episodic memory migration...');
      result.episodic = await this.migrateEpisodicMemories();
    } else if (status.episodicMarkdownCount > 0) {
      logger.memory.info(
        `Episodic memories already migrated (${status.episodicMarkdownCount} markdown files remain - may need manual cleanup)`
      );
    }

    // Migrate thinking memories if needed
    if (status.thinkingNeedsMigration) {
      logger.memory.info('Starting thinking memory migration...');
      result.thinking = await this.migrateThinkingMemories();
    } else if (status.thinkingMarkdownCount > 0) {
      logger.memory.info(
        `Thinking memories already migrated (${status.thinkingMarkdownCount} markdown files remain - may need manual cleanup)`
      );
    }

    // Delete Orama indexes to force rebuild with fresh embeddings
    if (result.episodic.migrated > 0 || result.thinking.migrated > 0) {
      logger.memory.info('Deleting Orama indexes to force rebuild...');
      result.oramaIndexesDeleted = await this.deleteOramaIndexes();
    }

    return result;
  }
}

/**
 * Run migration if needed (convenience function for startup)
 */
export async function runMigrationIfNeeded(baseDir?: string): Promise<MigrationResult | null> {
  const service = new MigrationService(baseDir);
  const status = await service.checkMigrationStatus();

  if (status.episodicNeedsMigration || status.thinkingNeedsMigration) {
    logger.memory.info('Migration needed, starting...');
    return service.runFullMigration();
  }

  logger.memory.debug('No migration needed');
  return null;
}
