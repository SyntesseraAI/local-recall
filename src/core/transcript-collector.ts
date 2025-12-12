import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

/**
 * UUID v4 regex pattern for validating transcript filenames
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a filename (without extension) is a valid UUID
 */
function isUuidFilename(filename: string): boolean {
  const nameWithoutExt = path.parse(filename).name;
  return UUID_REGEX.test(nameWithoutExt);
}

/**
 * Information about a transcript file
 */
export interface TranscriptInfo {
  /** Original path in Claude's cache */
  sourcePath: string;
  /** Path in local-recall/transcripts/ */
  localPath: string;
  /** Filename (used as identifier) */
  filename: string;
  /** Last modified timestamp */
  lastModified: Date;
  /** File size in bytes */
  size: number;
}

/**
 * Transcript Collector - finds and copies transcripts from Claude's cache
 */
export class TranscriptCollector {
  private claudeProjectsDir: string;
  private transcriptsDir: string;
  private projectPath: string;

  constructor(projectPath?: string) {
    const config = getConfig();
    this.projectPath = projectPath ?? process.cwd();
    this.claudeProjectsDir = path.join(os.homedir(), '.claude', 'projects');
    this.transcriptsDir = path.join(config.memoryDir, 'transcripts');
  }

  /**
   * Ensure the transcripts directory exists
   */
  private async ensureTranscriptsDir(): Promise<void> {
    await fs.mkdir(this.transcriptsDir, { recursive: true });
  }

  /**
   * Convert a project path to Claude's folder naming convention
   * Claude replaces all path separators with dashes
   * e.g., /Users/joe/Code/project -> -Users-joe-Code-project
   */
  private pathToClaudeFolderName(projectPath: string): string {
    const normalizedPath = path.resolve(projectPath);
    // Replace all path separators with dashes
    return normalizedPath.replace(/\//g, '-');
  }

  /**
   * Find the Claude project directory for the current project
   * Returns null if not found
   */
  async findClaudeProjectDir(): Promise<string | null> {
    logger.transcript.info(`Searching for Claude project transcripts...`);
    logger.transcript.info(`  Project path: ${this.projectPath}`);
    logger.transcript.info(`  Claude projects dir: ${this.claudeProjectsDir}`);

    try {
      await fs.access(this.claudeProjectsDir);
      logger.transcript.debug('Claude projects directory exists');
    } catch {
      logger.transcript.info('Claude projects directory not found - no Claude sessions exist yet');
      return null;
    }

    // Primary approach: Claude uses path with slashes replaced by dashes
    // e.g., /Users/joe/Code/project -> -Users-joe-Code-project
    const expectedFolderName = this.pathToClaudeFolderName(this.projectPath);
    const expectedDir = path.join(this.claudeProjectsDir, expectedFolderName);
    logger.transcript.info(`  Expected folder: ${expectedFolderName}`);

    try {
      await fs.access(expectedDir);
      // Transcripts are stored directly in the project folder as .jsonl files with UUID names
      const files = await fs.readdir(expectedDir);
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl') && isUuidFilename(f));
      if (jsonlFiles.length > 0) {
        logger.transcript.info(`  Found ${jsonlFiles.length} transcript file(s) at expected path`);
        return expectedDir;
      } else {
        logger.transcript.info(`  Expected folder exists but contains no transcript files`);
        logger.transcript.debug(`  Files found: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
      }
    } catch {
      logger.transcript.info(`  Expected folder not found - trying fallback search...`);
    }

    // Fallback: scan all directories and check cwd in transcript files
    const entries = await fs.readdir(this.claudeProjectsDir, { withFileTypes: true });
    const projectDirs = entries.filter((e) => e.isDirectory());
    logger.transcript.info(`  Scanning ${projectDirs.length} Claude project folders for matching cwd...`);

    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);

      try {
        // Transcripts are stored directly in the project folder with UUID filenames
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((f) => f.endsWith('.jsonl') && isUuidFilename(f));

        if (jsonlFiles.length > 0) {
          const firstFile = jsonlFiles[0];
          if (!firstFile) continue;

          const sampleFile = path.join(projectDir, firstFile);
          const content = await fs.readFile(sampleFile, 'utf-8');
          const firstLine = content.split('\n')[0];
          if (!firstLine) continue;

          try {
            const parsed = JSON.parse(firstLine);
            if (parsed.cwd && this.isMatchingProject(parsed.cwd)) {
              logger.transcript.info(`  Found matching project via cwd field: ${dir.name}`);
              return projectDir;
            }
          } catch {
            // Not valid JSON or no cwd field, continue checking
          }
        }
      } catch {
        // Can't read directory, skip
      }
    }

    // Last resort: check for directories ending with the project basename
    const basename = path.basename(this.projectPath);
    logger.transcript.debug(`  Trying basename match: *-${basename}`);

    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);

      if (dir.name.endsWith('-' + basename)) {
        try {
          const files = await fs.readdir(projectDir);
          const jsonlFiles = files.filter((f) => f.endsWith('.jsonl') && isUuidFilename(f));
          if (jsonlFiles.length > 0) {
            logger.transcript.info(`  Found Claude project via basename match: ${dir.name}`);
            return projectDir;
          }
        } catch {
          // Can't read directory
        }
      }
    }

    logger.transcript.info(`No matching Claude project directory found for: ${this.projectPath}`);
    logger.transcript.info(`  This is normal if you haven't run Claude Code in this repo yet.`);
    return null;
  }

  /**
   * Check if a path matches the current project
   */
  private isMatchingProject(cwdPath: string): boolean {
    const normalizedCwd = path.resolve(cwdPath);
    const normalizedProject = path.resolve(this.projectPath);
    return normalizedCwd === normalizedProject || normalizedCwd.startsWith(normalizedProject + path.sep);
  }

  /**
   * List all transcript files in Claude's cache for this project
   */
  async listSourceTranscripts(): Promise<TranscriptInfo[]> {
    const projectDir = await this.findClaudeProjectDir();
    if (!projectDir) {
      return [];
    }

    try {
      // Transcripts are stored directly in the project folder
      const files = await fs.readdir(projectDir);
      // Only include .jsonl files with UUID filenames (proper transcript files)
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl') && isUuidFilename(f));

      const transcripts: TranscriptInfo[] = [];

      for (const filename of jsonlFiles) {
        const sourcePath = path.join(projectDir, filename);
        const stats = await fs.stat(sourcePath);

        transcripts.push({
          sourcePath,
          localPath: path.join(this.transcriptsDir, filename),
          filename,
          lastModified: stats.mtime,
          size: stats.size,
        });
      }

      logger.transcript.debug(`Found ${transcripts.length} transcripts in Claude cache`);
      return transcripts;
    } catch (error) {
      logger.transcript.error('Error listing source transcripts', error);
      return [];
    }
  }

  /**
   * Copy a transcript from Claude's cache to local-recall/transcripts/
   */
  async copyTranscript(info: TranscriptInfo): Promise<void> {
    await this.ensureTranscriptsDir();

    try {
      await fs.copyFile(info.sourcePath, info.localPath);
      logger.transcript.debug(`Copied transcript: ${info.filename}`);
    } catch (error) {
      logger.transcript.error(`Failed to copy transcript: ${info.filename}`, error);
      throw error;
    }
  }

  /**
   * Copy all new or modified transcripts
   * Returns list of transcripts that were copied
   *
   * A transcript is considered unchanged if:
   * - Local file exists AND
   * - Local mtime >= source mtime AND
   * - Local size === source size
   *
   * Also runs cleanup to remove synthetic and invalid transcripts.
   */
  async syncTranscripts(): Promise<TranscriptInfo[]> {
    logger.transcript.info('Starting transcript sync...');

    // First, clean up any synthetic or invalid transcripts
    await this.cleanupTranscripts();

    const sourceTranscripts = await this.listSourceTranscripts();
    logger.transcript.info(`Found ${sourceTranscripts.length} transcript(s) in Claude cache`);

    if (sourceTranscripts.length === 0) {
      logger.transcript.info('No transcripts to sync');
      return [];
    }

    const copied: TranscriptInfo[] = [];
    let skippedUpToDate = 0;
    let skippedSynthetic = 0;
    let skippedNoThinking = 0;

    for (const transcript of sourceTranscripts) {
      try {
        // Check if local copy exists and is up to date
        const localStats = await fs.stat(transcript.localPath);

        // Skip if mtime is current AND size matches
        if (localStats.mtime >= transcript.lastModified && localStats.size === transcript.size) {
          // Local copy is up to date
          skippedUpToDate++;
          continue;
        }

        // File exists but changed - will be copied and reprocessed via content hash check
        logger.transcript.debug(`Transcript changed (mtime or size): ${transcript.filename}`);
      } catch {
        // Local file doesn't exist, needs to be copied
      }

      // Skip synthetic transcripts before copying
      if (await this.isSyntheticFile(transcript.sourcePath)) {
        logger.transcript.debug(`Skipping synthetic transcript: ${transcript.filename}`);
        skippedSynthetic++;
        continue;
      }

      // Skip transcripts without thinking blocks (e.g., Haiku transcripts)
      if (!(await this.hasThinkingBlocks(transcript.sourcePath))) {
        logger.transcript.debug(`Skipping transcript without thinking: ${transcript.filename}`);
        skippedNoThinking++;
        continue;
      }

      await this.copyTranscript(transcript);
      copied.push(transcript);
    }

    // Log summary
    logger.transcript.info(`Transcript sync complete:`);
    logger.transcript.info(`  Copied: ${copied.length}`);
    logger.transcript.info(`  Skipped (up-to-date): ${skippedUpToDate}`);
    logger.transcript.info(`  Skipped (synthetic): ${skippedSynthetic}`);
    logger.transcript.info(`  Skipped (no thinking blocks): ${skippedNoThinking}`);

    return copied;
  }

  /**
   * List all transcripts in the local transcripts folder
   */
  async listLocalTranscripts(): Promise<TranscriptInfo[]> {
    await this.ensureTranscriptsDir();

    try {
      const files = await fs.readdir(this.transcriptsDir);
      // Only include .jsonl files with UUID filenames (proper transcript files)
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl') && isUuidFilename(f));

      const transcripts: TranscriptInfo[] = [];

      for (const filename of jsonlFiles) {
        const localPath = path.join(this.transcriptsDir, filename);
        const stats = await fs.stat(localPath);

        transcripts.push({
          sourcePath: '', // Unknown for local-only files
          localPath,
          filename,
          lastModified: stats.mtime,
          size: stats.size,
        });
      }

      return transcripts;
    } catch (error) {
      logger.transcript.error('Error listing local transcripts', error);
      return [];
    }
  }

  /**
   * Read the content of a transcript file
   */
  async readTranscript(info: TranscriptInfo): Promise<string> {
    return fs.readFile(info.localPath, 'utf-8');
  }

  /**
   * Compute a hash of transcript content for change detection
   */
  async computeTranscriptHash(info: TranscriptInfo): Promise<string> {
    const content = await this.readTranscript(info);
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * Check if a transcript is synthetic (generated by memory extraction, not a real session)
   * Synthetic transcripts have model: "<synthetic>" in assistant messages
   */
  async isSyntheticTranscript(info: TranscriptInfo): Promise<boolean> {
    try {
      const content = await this.readTranscript(info);
      // Check first few KB for the synthetic marker - no need to read entire file
      const sample = content.slice(0, 10000);
      return sample.includes('"<synthetic>"') || sample.includes('"model":"<synthetic>"');
    } catch {
      // If we can't read it, assume it's not synthetic
      return false;
    }
  }

  /**
   * Check if a file path contains a synthetic transcript
   */
  private async isSyntheticFile(filePath: string): Promise<boolean> {
    try {
      const handle = await fs.open(filePath, 'r');
      try {
        // Read only first 10KB to check for synthetic marker
        const buffer = Buffer.alloc(10000);
        const { bytesRead } = await handle.read(buffer, 0, 10000, 0);
        const sample = buffer.toString('utf-8', 0, bytesRead);
        return sample.includes('"<synthetic>"') || sample.includes('"model":"<synthetic>"');
      } finally {
        await handle.close();
      }
    } catch {
      return false;
    }
  }

  /**
   * Check if a file contains thinking blocks
   * Thinking blocks appear as content blocks with "type":"thinking"
   * This is used to skip Haiku transcripts which don't have thinking
   */
  private async hasThinkingBlocks(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      // Check for thinking block markers in the transcript
      // Thinking blocks appear as {"type":"thinking",...} in content arrays
      return content.includes('"type":"thinking"') || content.includes('"type": "thinking"');
    } catch {
      return false;
    }
  }

  /**
   * Clean up the local transcripts folder by removing:
   * - Files that don't match the UUID.jsonl format
   * - Synthetic transcripts (generated by memory extraction)
   * - Transcripts without thinking blocks (e.g., Haiku transcripts)
   *
   * Returns count of files removed
   */
  async cleanupTranscripts(): Promise<{ invalidFormat: number; synthetic: number; noThinking: number }> {
    await this.ensureTranscriptsDir();

    let invalidFormat = 0;
    let synthetic = 0;
    let noThinking = 0;

    try {
      const files = await fs.readdir(this.transcriptsDir);

      for (const filename of files) {
        const filePath = path.join(this.transcriptsDir, filename);

        // Check if it's a file (not directory)
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
          continue;
        }

        // Check for valid UUID.jsonl format
        if (!filename.endsWith('.jsonl') || !isUuidFilename(filename)) {
          logger.transcript.info(`Removing invalid format file: ${filename}`);
          await fs.unlink(filePath);
          invalidFormat++;
          continue;
        }

        // Check for synthetic transcript
        if (await this.isSyntheticFile(filePath)) {
          logger.transcript.info(`Removing synthetic transcript: ${filename}`);
          await fs.unlink(filePath);
          synthetic++;
          continue;
        }

        // Check for transcripts without thinking blocks
        if (!(await this.hasThinkingBlocks(filePath))) {
          logger.transcript.info(`Removing transcript without thinking: ${filename}`);
          await fs.unlink(filePath);
          noThinking++;
        }
      }

      if (invalidFormat > 0 || synthetic > 0 || noThinking > 0) {
        logger.transcript.info(`Cleanup complete: removed ${invalidFormat} invalid format, ${synthetic} synthetic, ${noThinking} no-thinking transcripts`);
      }

      return { invalidFormat, synthetic, noThinking };
    } catch (error) {
      logger.transcript.error('Error during transcript cleanup', error);
      return { invalidFormat, synthetic, noThinking };
    }
  }
}
