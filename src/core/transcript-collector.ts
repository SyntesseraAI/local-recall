import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

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
    logger.transcript.debug(`Looking for Claude project for: ${this.projectPath}`);
    logger.transcript.debug(`Claude projects directory: ${this.claudeProjectsDir}`);

    try {
      await fs.access(this.claudeProjectsDir);
    } catch {
      logger.transcript.debug('Claude projects directory not found');
      return null;
    }

    // Primary approach: Claude uses path with slashes replaced by dashes
    // e.g., /Users/joe/Code/project -> -Users-joe-Code-project
    const expectedFolderName = this.pathToClaudeFolderName(this.projectPath);
    const expectedDir = path.join(this.claudeProjectsDir, expectedFolderName);
    logger.transcript.debug(`Expected folder name: ${expectedFolderName}`);
    logger.transcript.debug(`Checking path: ${expectedDir}`);

    try {
      await fs.access(expectedDir);
      // Transcripts are stored directly in the project folder as .jsonl files
      const files = await fs.readdir(expectedDir);
      const hasTranscripts = files.some((f) => f.endsWith('.jsonl'));
      if (hasTranscripts) {
        logger.transcript.debug(`Found Claude project via path convention: ${expectedFolderName}`);
        return expectedDir;
      } else {
        logger.transcript.debug(`Claude project found but no transcript files: ${expectedFolderName}`);
      }
    } catch {
      logger.transcript.debug(`No Claude project at expected path: ${expectedFolderName}`);
    }

    // Fallback: scan all directories and check cwd in transcript files
    const entries = await fs.readdir(this.claudeProjectsDir, { withFileTypes: true });
    const projectDirs = entries.filter((e) => e.isDirectory());

    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);

      try {
        // Transcripts are stored directly in the project folder
        const files = await fs.readdir(projectDir);
        const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

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
              logger.transcript.debug(`Found matching Claude project via cwd: ${dir.name}`);
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
    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);

      if (dir.name.endsWith('-' + path.basename(this.projectPath))) {
        try {
          const files = await fs.readdir(projectDir);
          const hasTranscripts = files.some((f) => f.endsWith('.jsonl'));
          if (hasTranscripts) {
            logger.transcript.debug(`Found Claude project via basename match: ${dir.name}`);
            return projectDir;
          }
        } catch {
          // Can't read directory
        }
      }
    }

    logger.transcript.warn('Could not find matching Claude project directory');
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
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

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
   */
  async syncTranscripts(): Promise<TranscriptInfo[]> {
    const sourceTranscripts = await this.listSourceTranscripts();
    const copied: TranscriptInfo[] = [];

    for (const transcript of sourceTranscripts) {
      try {
        // Check if local copy exists and is up to date
        const localStats = await fs.stat(transcript.localPath);

        // Skip if mtime is current AND size matches
        if (localStats.mtime >= transcript.lastModified && localStats.size === transcript.size) {
          // Local copy is up to date
          continue;
        }

        // File exists but changed - will be copied and reprocessed via content hash check
        logger.transcript.debug(`Transcript changed (mtime or size): ${transcript.filename}`);
      } catch {
        // Local file doesn't exist, needs to be copied
      }

      await this.copyTranscript(transcript);
      copied.push(transcript);
    }

    if (copied.length > 0) {
      logger.transcript.info(`Synced ${copied.length} transcripts from Claude cache`);
    }

    return copied;
  }

  /**
   * List all transcripts in the local transcripts folder
   */
  async listLocalTranscripts(): Promise<TranscriptInfo[]> {
    await this.ensureTranscriptsDir();

    try {
      const files = await fs.readdir(this.transcriptsDir);
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

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
}
