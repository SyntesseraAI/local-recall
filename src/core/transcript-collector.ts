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
   * Compute the project hash that Claude uses for folder names
   * Claude uses a base64-encoded hash of the project path
   */
  private computeProjectHash(projectPath: string): string {
    // Claude appears to use the absolute path with forward slashes
    const normalizedPath = path.resolve(projectPath).replace(/\\/g, '/');
    const hash = createHash('sha256').update(normalizedPath).digest('base64url');
    return hash;
  }

  /**
   * Find the Claude project directory for the current project
   * Returns null if not found
   */
  async findClaudeProjectDir(): Promise<string | null> {
    try {
      await fs.access(this.claudeProjectsDir);
    } catch {
      logger.transcript.debug('Claude projects directory not found');
      return null;
    }

    const entries = await fs.readdir(this.claudeProjectsDir, { withFileTypes: true });
    const projectDirs = entries.filter((e) => e.isDirectory());

    // Claude stores project info in a CLAUDE.md or similar file
    // We need to check each directory to find the matching project
    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);
      const transcriptsPath = path.join(projectDir, 'transcripts');

      try {
        await fs.access(transcriptsPath);

        // Check if there's a project marker file that tells us the path
        // Try reading a session file to check the cwd
        const files = await fs.readdir(transcriptsPath);
        const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

        if (jsonlFiles.length > 0) {
          // Read first line of first transcript to check the project path
          const firstFile = jsonlFiles[0];
          if (!firstFile) continue;

          const sampleFile = path.join(transcriptsPath, firstFile);
          const content = await fs.readFile(sampleFile, 'utf-8');
          const firstLine = content.split('\n')[0];
          if (!firstLine) continue;

          try {
            const parsed = JSON.parse(firstLine);
            // Look for working directory in the transcript
            if (parsed.cwd && this.isMatchingProject(parsed.cwd)) {
              logger.transcript.debug(`Found matching Claude project: ${dir.name}`);
              return projectDir;
            }
          } catch {
            // Not valid JSON or no cwd field, continue checking
          }
        }
      } catch {
        // No transcripts folder, skip
      }
    }

    // Fallback: try the hash-based approach
    const projectHash = this.computeProjectHash(this.projectPath);
    const hashBasedDir = path.join(this.claudeProjectsDir, projectHash);

    try {
      await fs.access(hashBasedDir);
      logger.transcript.debug(`Found Claude project via hash: ${projectHash}`);
      return hashBasedDir;
    } catch {
      // Hash-based lookup failed
    }

    // Last resort: check all directories and compare paths
    for (const dir of projectDirs) {
      const projectDir = path.join(this.claudeProjectsDir, dir.name);

      // Check if dir.name is a path-like string that matches our project
      if (dir.name.includes(path.basename(this.projectPath))) {
        const transcriptsPath = path.join(projectDir, 'transcripts');
        try {
          await fs.access(transcriptsPath);
          logger.transcript.debug(`Found Claude project via name match: ${dir.name}`);
          return projectDir;
        } catch {
          // No transcripts folder
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

    const transcriptsPath = path.join(projectDir, 'transcripts');

    try {
      const files = await fs.readdir(transcriptsPath);
      const jsonlFiles = files.filter((f) => f.endsWith('.jsonl'));

      const transcripts: TranscriptInfo[] = [];

      for (const filename of jsonlFiles) {
        const sourcePath = path.join(transcriptsPath, filename);
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
   */
  async syncTranscripts(): Promise<TranscriptInfo[]> {
    const sourceTranscripts = await this.listSourceTranscripts();
    const copied: TranscriptInfo[] = [];

    for (const transcript of sourceTranscripts) {
      try {
        // Check if local copy exists and is up to date
        const localStats = await fs.stat(transcript.localPath);

        if (localStats.mtime >= transcript.lastModified) {
          // Local copy is up to date
          continue;
        }
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
