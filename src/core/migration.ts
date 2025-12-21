/**
 * Migration Service
 *
 * Handles migration from markdown file storage to JSONL format.
 * Checks for existing markdown files and migrates them to JSONL.
 * Deletes old markdown folders after successful migration.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { parseMarkdown } from '../utils/markdown.js';
import { memoryFrontmatterSchema, thinkingMemoryFrontmatterSchema } from './types.js';
import { EpisodicJsonlStore } from './episodic-jsonl-store.js';
import { ThinkingJsonlStore } from './thinking-jsonl-store.js';
import type { EpisodicAddEntry } from './jsonl-types.js';
import type { ThinkingAddEntry } from './jsonl-types.js';

/**
 * Result of migration operation
 */
export interface MigrationResult {
  episodic: {
    migrated: number;
    errors: string[];
  };
  thinking: {
    migrated: number;
    errors: string[];
  };
  foldersDeleted: boolean;
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
 */
export class MigrationService {
  private baseDir: string;
  private episodicDir: string;
  private thinkingDir: string;
  private episodicJsonlPath: string;
  private thinkingJsonlPath: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.episodicDir = path.join(this.baseDir, 'episodic-memory');
    this.thinkingDir = path.join(this.baseDir, 'thinking-memory');
    this.episodicJsonlPath = path.join(this.baseDir, 'episodic.jsonl');
    this.thinkingJsonlPath = path.join(this.baseDir, 'thinking.jsonl');
  }

  /**
   * Check if directories/files exist
   */
  private async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Count markdown files in a directory
   */
  private async countMarkdownFiles(dir: string): Promise<number> {
    try {
      const files = await fs.readdir(dir);
      return files.filter((f) => f.endsWith('.md')).length;
    } catch {
      return 0;
    }
  }

  /**
   * Check if migration is needed
   *
   * Migration is needed when:
   * - Markdown directory exists AND contains files
   * - JSONL file does NOT exist
   */
  async checkMigrationStatus(): Promise<MigrationStatus> {
    const [episodicDirExists, thinkingDirExists, episodicJsonlExists, thinkingJsonlExists] =
      await Promise.all([
        this.exists(this.episodicDir),
        this.exists(this.thinkingDir),
        this.exists(this.episodicJsonlPath),
        this.exists(this.thinkingJsonlPath),
      ]);

    const episodicMarkdownCount = episodicDirExists
      ? await this.countMarkdownFiles(this.episodicDir)
      : 0;
    const thinkingMarkdownCount = thinkingDirExists
      ? await this.countMarkdownFiles(this.thinkingDir)
      : 0;

    return {
      episodicNeedsMigration: episodicMarkdownCount > 0 && !episodicJsonlExists,
      thinkingNeedsMigration: thinkingMarkdownCount > 0 && !thinkingJsonlExists,
      episodicMarkdownCount,
      thinkingMarkdownCount,
    };
  }

  /**
   * Migrate episodic memories from markdown to JSONL
   */
  async migrateEpisodicMemories(): Promise<{ migrated: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;

    try {
      const files = await fs.readdir(this.episodicDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      if (mdFiles.length === 0) {
        logger.memory.info('No episodic markdown files to migrate');
        return { migrated: 0, errors: [] };
      }

      logger.memory.info(`Migrating ${mdFiles.length} episodic memories from markdown to JSONL`);

      // Ensure base directory exists
      await fs.mkdir(this.baseDir, { recursive: true });

      for (const file of mdFiles) {
        try {
          const filePath = path.join(this.episodicDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { frontmatter, body } = parseMarkdown(content);

          // Validate frontmatter
          const validated = memoryFrontmatterSchema.parse(frontmatter);

          // Create JSONL add entry
          const entry: EpisodicAddEntry = {
            action: 'add',
            id: validated.id,
            subject: validated.subject,
            keywords: validated.keywords,
            applies_to: validated.applies_to,
            occurred_at: validated.occurred_at,
            content_hash: validated.content_hash,
            content: body,
            timestamp: new Date().toISOString(),
          };

          // Append to JSONL file
          const line = JSON.stringify(entry) + '\n';
          await fs.appendFile(this.episodicJsonlPath, line, 'utf-8');
          migrated++;
        } catch (error) {
          const errorMsg = `Failed to migrate ${file}: ${error}`;
          errors.push(errorMsg);
          logger.memory.warn(errorMsg);
        }
      }

      logger.memory.info(`Migrated ${migrated}/${mdFiles.length} episodic memories`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return { migrated, errors };
  }

  /**
   * Migrate thinking memories from markdown to JSONL
   */
  async migrateThinkingMemories(): Promise<{ migrated: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;

    try {
      const files = await fs.readdir(this.thinkingDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      if (mdFiles.length === 0) {
        logger.memory.info('No thinking markdown files to migrate');
        return { migrated: 0, errors: [] };
      }

      logger.memory.info(`Migrating ${mdFiles.length} thinking memories from markdown to JSONL`);

      // Ensure base directory exists
      await fs.mkdir(this.baseDir, { recursive: true });

      for (const file of mdFiles) {
        try {
          const filePath = path.join(this.thinkingDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { frontmatter, body } = parseMarkdown(content);

          // Validate frontmatter
          const validated = thinkingMemoryFrontmatterSchema.parse(frontmatter);

          // Create JSONL add entry
          const entry: ThinkingAddEntry = {
            action: 'add',
            id: validated.id,
            subject: validated.subject,
            applies_to: validated.applies_to,
            occurred_at: validated.occurred_at,
            content_hash: validated.content_hash,
            content: body,
            timestamp: new Date().toISOString(),
          };

          // Append to JSONL file
          const line = JSON.stringify(entry) + '\n';
          await fs.appendFile(this.thinkingJsonlPath, line, 'utf-8');
          migrated++;
        } catch (error) {
          const errorMsg = `Failed to migrate ${file}: ${error}`;
          errors.push(errorMsg);
          logger.memory.warn(errorMsg);
        }
      }

      logger.memory.info(`Migrated ${migrated}/${mdFiles.length} thinking memories`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return { migrated, errors };
  }

  /**
   * Delete old markdown folders after successful migration
   *
   * Only deletes if:
   * - JSONL file exists
   * - At least 95% of markdown files were successfully migrated
   */
  async deleteOldFolders(): Promise<boolean> {
    let deleted = false;

    // Check if episodic folder can be deleted
    if (await this.exists(this.episodicJsonlPath)) {
      try {
        const episodicStore = new EpisodicJsonlStore({ baseDir: this.baseDir });
        await episodicStore.initialize();
        const jsonlCount = await episodicStore.count();
        const mdCount = await this.countMarkdownFiles(this.episodicDir);

        // Only delete if at least 95% migrated
        if (mdCount === 0 || jsonlCount >= mdCount * 0.95) {
          try {
            await fs.rm(this.episodicDir, { recursive: true, force: true });
            logger.memory.info(`Deleted old episodic-memory folder after successful migration`);
            deleted = true;
          } catch (error) {
            logger.memory.warn(`Failed to delete episodic-memory folder: ${error}`);
          }
        } else {
          logger.memory.warn(
            `Skipping episodic-memory deletion: only ${jsonlCount}/${mdCount} memories migrated`
          );
        }
      } catch (error) {
        logger.memory.warn(`Failed to verify episodic migration: ${error}`);
      }
    }

    // Check if thinking folder can be deleted
    if (await this.exists(this.thinkingJsonlPath)) {
      try {
        const thinkingStore = new ThinkingJsonlStore({ baseDir: this.baseDir });
        await thinkingStore.initialize();
        const jsonlCount = await thinkingStore.count();
        const mdCount = await this.countMarkdownFiles(this.thinkingDir);

        // Only delete if at least 95% migrated
        if (mdCount === 0 || jsonlCount >= mdCount * 0.95) {
          try {
            await fs.rm(this.thinkingDir, { recursive: true, force: true });
            logger.memory.info(`Deleted old thinking-memory folder after successful migration`);
            deleted = true;
          } catch (error) {
            logger.memory.warn(`Failed to delete thinking-memory folder: ${error}`);
          }
        } else {
          logger.memory.warn(
            `Skipping thinking-memory deletion: only ${jsonlCount}/${mdCount} memories migrated`
          );
        }
      } catch (error) {
        logger.memory.warn(`Failed to verify thinking migration: ${error}`);
      }
    }

    return deleted;
  }

  /**
   * Run full migration process
   *
   * 1. Check if migration is needed
   * 2. Migrate memories to JSONL
   * 3. Delete old markdown folders
   */
  async runFullMigration(): Promise<MigrationResult> {
    const status = await this.checkMigrationStatus();

    const result: MigrationResult = {
      episodic: { migrated: 0, errors: [] },
      thinking: { migrated: 0, errors: [] },
      foldersDeleted: false,
    };

    // Migrate episodic memories if needed
    if (status.episodicNeedsMigration) {
      logger.memory.info('Starting episodic memory migration...');
      result.episodic = await this.migrateEpisodicMemories();
    } else if (status.episodicMarkdownCount > 0) {
      logger.memory.info('Episodic memories already migrated (JSONL file exists)');
    }

    // Migrate thinking memories if needed
    if (status.thinkingNeedsMigration) {
      logger.memory.info('Starting thinking memory migration...');
      result.thinking = await this.migrateThinkingMemories();
    } else if (status.thinkingMarkdownCount > 0) {
      logger.memory.info('Thinking memories already migrated (JSONL file exists)');
    }

    // Delete old folders after migration
    if (
      result.episodic.migrated > 0 ||
      result.thinking.migrated > 0 ||
      status.episodicMarkdownCount > 0 ||
      status.thinkingMarkdownCount > 0
    ) {
      result.foldersDeleted = await this.deleteOldFolders();
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

  // Check if we need to delete old folders (JSONL exists but markdown still there)
  if (status.episodicMarkdownCount > 0 || status.thinkingMarkdownCount > 0) {
    logger.memory.info('Cleaning up old markdown folders...');
    await service.deleteOldFolders();
  }

  return null;
}
