import { spawn } from 'node:child_process';
import { MemoryManager } from './memory.js';
import { IndexManager } from './index.js';
import { ProcessedLogManager } from './processed-log.js';
import { TranscriptCollector, type TranscriptInfo } from './transcript-collector.js';
import type { MemoryScope } from './types.js';
import {
  buildMemoryExtractionPrompt,
  extractedMemoriesSchema,
  type ExtractedMemory,
} from '../prompts/memory-extraction.js';
import { logger } from '../utils/logger.js';
import { getConfig } from '../utils/config.js';

/**
 * Result of processing a single transcript
 */
export interface ProcessingResult {
  filename: string;
  success: boolean;
  memoriesCreated: string[];
  error?: string;
}

/**
 * Options for the memory extractor
 */
export interface ExtractorOptions {
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  baseDelay?: number;
  /** Timeout for Claude CLI (ms) */
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<ExtractorOptions> = {
  maxRetries: 3,
  baseDelay: 2000,
  timeout: 120000, // 2 minutes
};

/**
 * Memory Extractor - uses Claude CLI to extract memories from transcripts
 */
export class MemoryExtractor {
  private memoryManager: MemoryManager;
  private indexManager: IndexManager;
  private processedLog: ProcessedLogManager;
  private transcriptCollector: TranscriptCollector;
  private projectPath: string;
  private options: Required<ExtractorOptions>;

  constructor(projectPath?: string, options?: ExtractorOptions) {
    const config = getConfig();
    this.projectPath = projectPath ?? process.cwd();
    this.memoryManager = new MemoryManager(config.memoryDir);
    this.indexManager = new IndexManager(config.memoryDir);
    this.processedLog = new ProcessedLogManager(config.memoryDir);
    this.transcriptCollector = new TranscriptCollector(this.projectPath);
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Call Claude CLI with a prompt and get JSON response
   */
  private async callClaudeCLI(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = ['-p', prompt, '--output-format', 'json'];

      const child = spawn('claude', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.options.timeout,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        }
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Claude CLI timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);

      child.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Call Claude CLI with retry logic
   */
  private async callClaudeCLIWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        return await this.callClaudeCLI(prompt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.extractor.warn(`Claude CLI attempt ${attempt + 1} failed: ${lastError.message}`);

        if (attempt < this.options.maxRetries - 1) {
          const delay = this.options.baseDelay * Math.pow(2, attempt);
          logger.extractor.debug(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError ?? new Error('Claude CLI failed after retries');
  }

  /**
   * Parse Claude CLI JSON output and extract memories
   */
  private parseClaudeResponse(response: string): ExtractedMemory[] {
    try {
      // The response might be wrapped in a result object from --output-format json
      let parsed = JSON.parse(response);

      // Handle different response formats
      if (parsed.result) {
        // If result is a string (JSON stringified), parse it
        if (typeof parsed.result === 'string') {
          parsed = JSON.parse(parsed.result);
        } else {
          parsed = parsed.result;
        }
      }

      // Handle if the memories are nested
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      const validated = extractedMemoriesSchema.parse(parsed);
      return validated.memories;
    } catch (error) {
      logger.extractor.error('Failed to parse Claude response', error);

      // Try to extract JSON from the response (Claude might include explanation text)
      const jsonMatch = response.match(/\{[\s\S]*"memories"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          const validated = extractedMemoriesSchema.parse(extracted);
          return validated.memories;
        } catch {
          // Give up
        }
      }

      return [];
    }
  }

  /**
   * Delete memories by their IDs
   */
  private async deleteMemories(memoryIds: string[]): Promise<void> {
    for (const id of memoryIds) {
      try {
        await this.memoryManager.deleteMemory(id);
        logger.extractor.debug(`Deleted old memory: ${id}`);
      } catch (error) {
        logger.extractor.warn(`Failed to delete memory ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Process a single transcript and create memories
   */
  async processTranscript(transcript: TranscriptInfo): Promise<ProcessingResult> {
    logger.extractor.info(`Processing transcript: ${transcript.filename}`);

    try {
      // Compute content hash
      const contentHash = await this.transcriptCollector.computeTranscriptHash(transcript);

      // Check if already processed with same hash
      const needsProcessing = await this.processedLog.needsProcessing(
        transcript.filename,
        contentHash
      );

      if (!needsProcessing) {
        logger.extractor.debug(`Transcript already processed: ${transcript.filename}`);
        return {
          filename: transcript.filename,
          success: true,
          memoriesCreated: [],
        };
      }

      // Get old memory IDs for cleanup
      const oldMemoryIds = await this.processedLog.getMemoryIds(transcript.filename);
      if (oldMemoryIds.length > 0) {
        await this.deleteMemories(oldMemoryIds);
      }

      // Read transcript content
      const content = await this.transcriptCollector.readTranscript(transcript);

      // Build prompt
      const prompt = buildMemoryExtractionPrompt(content, this.projectPath);

      // Call Claude CLI
      const response = await this.callClaudeCLIWithRetry(prompt);

      // Parse response
      const extractedMemories = this.parseClaudeResponse(response);

      if (extractedMemories.length === 0) {
        logger.extractor.info(`No memories extracted from: ${transcript.filename}`);
        await this.processedLog.recordProcessed(
          transcript.filename,
          transcript.sourcePath,
          contentHash,
          transcript.lastModified,
          []
        );
        return {
          filename: transcript.filename,
          success: true,
          memoriesCreated: [],
        };
      }

      // Create memories
      const createdIds: string[] = [];
      const now = new Date().toISOString();

      for (const extracted of extractedMemories) {
        try {
          const memory = await this.memoryManager.createMemory({
            subject: extracted.subject,
            keywords: extracted.keywords,
            applies_to: extracted.applies_to as MemoryScope,
            content: extracted.content,
            occurred_at: now,
          });
          createdIds.push(memory.id);
        } catch (error) {
          logger.extractor.error(`Failed to create memory: ${extracted.subject}`, error);
        }
      }

      // Refresh index
      if (createdIds.length > 0) {
        await this.indexManager.buildIndex();
      }

      // Record in processed log
      await this.processedLog.recordProcessed(
        transcript.filename,
        transcript.sourcePath,
        contentHash,
        transcript.lastModified,
        createdIds
      );

      logger.extractor.info(
        `Created ${createdIds.length} memories from: ${transcript.filename}`
      );

      return {
        filename: transcript.filename,
        success: true,
        memoriesCreated: createdIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.extractor.error(`Failed to process transcript: ${transcript.filename}`, error);

      return {
        filename: transcript.filename,
        success: false,
        memoriesCreated: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Process all unprocessed transcripts
   */
  async processAllTranscripts(): Promise<ProcessingResult[]> {
    logger.extractor.info('Starting transcript processing run');

    // Sync transcripts from Claude cache
    await this.transcriptCollector.syncTranscripts();

    // Get all local transcripts
    const transcripts = await this.transcriptCollector.listLocalTranscripts();
    logger.extractor.info(`Found ${transcripts.length} transcripts to check`);

    const results: ProcessingResult[] = [];

    for (const transcript of transcripts) {
      const result = await this.processTranscript(transcript);
      results.push(result);
    }

    const successful = results.filter((r) => r.success);
    const memoriesCreated = results.reduce((sum, r) => sum + r.memoriesCreated.length, 0);

    logger.extractor.info(
      `Processing complete: ${successful.length}/${results.length} transcripts, ${memoriesCreated} memories created`
    );

    return results;
  }
}

/**
 * Process transcripts in daemon mode (called periodically)
 */
export async function runTranscriptProcessing(projectPath?: string): Promise<ProcessingResult[]> {
  const extractor = new MemoryExtractor(projectPath);
  return extractor.processAllTranscripts();
}
