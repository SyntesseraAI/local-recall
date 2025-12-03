import { ThinkingMemoryManager, generateSubjectFromContent } from './thinking-memory.js';
import { ThinkingProcessedLogManager } from './thinking-processed-log.js';
import { TranscriptCollector, type TranscriptInfo } from './transcript-collector.js';
import type { ContentBlock, MemoryScope } from './types.js';
import { logger } from '../utils/logger.js';
import { getConfig } from '../utils/config.js';

/**
 * Extracted thinking block from a transcript with its corresponding output
 */
interface ExtractedThinking {
  thinking: string;
  output: string;
  timestamp: string;
}

/**
 * Result of processing a single transcript for thinking memories
 */
export interface ThinkingProcessingResult {
  filename: string;
  success: boolean;
  memoriesCreated: string[];
  error?: string;
}

/**
 * Options for the thinking extractor
 */
export interface ThinkingExtractorOptions {
  /** Maximum concurrent transcript processors (default: 20) */
  concurrency?: number;
}

const DEFAULT_OPTIONS: Required<ThinkingExtractorOptions> = {
  concurrency: 20,
};

/**
 * Extract thinking content from content blocks array
 */
function extractThinkingFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is { type: 'thinking'; thinking: string } => block.type === 'thinking')
    .map((block) => block.thinking)
    .join('\n');
}

/**
 * Extract text content from content blocks array (excludes tool use)
 */
function extractTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

/**
 * Raw transcript entry structure (JSONL line format from Claude Code)
 */
interface RawTranscriptEntry {
  type: string;
  timestamp?: string;
  message?: {
    id?: string;
    role?: string;
    content?: string | ContentBlock[];
  };
}

/**
 * Aggregated message content from multiple JSONL lines with the same message.id
 */
interface AggregatedMessage {
  messageId: string;
  timestamp: string;
  thinkingParts: string[];
  textParts: string[];
}

/**
 * Parse raw JSONL transcript and extract thinking blocks with their outputs
 *
 * Claude Code streams assistant responses as separate JSONL lines - each content block
 * (thinking, text, tool_use) gets its own line, but they share the same message.id.
 * This function groups entries by message.id to reconstruct complete messages.
 */
function parseTranscriptForThinking(rawContent: string): ExtractedThinking[] {
  const lines = rawContent.split('\n').filter((line) => line.trim());
  const thinkingBlocks: ExtractedThinking[] = [];

  // Group entries by message.id to handle streamed responses
  const messageMap = new Map<string, AggregatedMessage>();

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as RawTranscriptEntry;

      // Only process assistant message entries
      if (entry.type !== 'assistant') {
        continue;
      }

      const messageId = entry.message?.id;
      if (!messageId) {
        continue;
      }

      const timestamp = entry.timestamp ?? new Date().toISOString();
      const rawContentBlock = entry.message?.content;

      if (!Array.isArray(rawContentBlock)) {
        continue;
      }

      // Get or create aggregated message for this ID
      let aggregated = messageMap.get(messageId);
      if (!aggregated) {
        aggregated = {
          messageId,
          timestamp,
          thinkingParts: [],
          textParts: [],
        };
        messageMap.set(messageId, aggregated);
      }

      // Extract thinking and text content from this line's content blocks
      const thinkingContent = extractThinkingFromBlocks(rawContentBlock);
      const textOutput = extractTextFromBlocks(rawContentBlock);

      if (thinkingContent.trim()) {
        aggregated.thinkingParts.push(thinkingContent);
      }
      if (textOutput.trim()) {
        aggregated.textParts.push(textOutput);
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Convert aggregated messages to thinking blocks
  for (const aggregated of messageMap.values()) {
    const thinking = aggregated.thinkingParts.join('\n');
    const output = aggregated.textParts.join('\n');

    // Only include if there's both thinking AND text output (skip tool-only responses)
    if (thinking.trim() && output.trim()) {
      thinkingBlocks.push({
        thinking,
        output,
        timestamp: aggregated.timestamp,
      });
    }
  }

  return thinkingBlocks;
}

/**
 * Thinking Extractor - extracts thinking blocks from transcripts directly
 * No Claude CLI call needed - thinking content is used as-is
 */
export class ThinkingExtractor {
  private memoryManager: ThinkingMemoryManager;
  private processedLog: ThinkingProcessedLogManager;
  private transcriptCollector: TranscriptCollector;
  private projectPath: string;
  private options: Required<ThinkingExtractorOptions>;

  constructor(projectPath?: string, options?: ThinkingExtractorOptions) {
    const config = getConfig();
    this.projectPath = projectPath ?? process.cwd();
    this.memoryManager = new ThinkingMemoryManager(config.memoryDir);
    this.processedLog = new ThinkingProcessedLogManager(config.memoryDir);
    this.transcriptCollector = new TranscriptCollector(this.projectPath);
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Delete thinking memories by their IDs
   */
  private async deleteMemories(memoryIds: string[]): Promise<void> {
    for (const id of memoryIds) {
      try {
        await this.memoryManager.deleteMemory(id);
        logger.extractor.debug(`Deleted old thinking memory: ${id}`);
      } catch (error) {
        logger.extractor.warn(`Failed to delete thinking memory ${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Process a single transcript and create thinking memories
   */
  async processTranscript(transcript: TranscriptInfo): Promise<ThinkingProcessingResult> {
    logger.extractor.info(`Processing transcript for thinking: ${transcript.filename}`);

    try {
      // Skip synthetic transcripts (generated by memory extraction, not real sessions)
      const isSynthetic = await this.transcriptCollector.isSyntheticTranscript(transcript);
      if (isSynthetic) {
        logger.extractor.debug(`Skipping synthetic transcript: ${transcript.filename}`);
        return {
          filename: transcript.filename,
          success: true,
          memoriesCreated: [],
        };
      }

      // Compute content hash
      const contentHash = await this.transcriptCollector.computeTranscriptHash(transcript);

      // Check if already processed with same hash
      const needsProcessing = await this.processedLog.needsProcessing(transcript.filename, contentHash);

      if (!needsProcessing) {
        logger.extractor.debug(`Transcript already processed for thinking: ${transcript.filename}`);
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

      // Read transcript content and extract thinking blocks
      const rawContent = await this.transcriptCollector.readTranscript(transcript);
      const thinkingBlocks = parseTranscriptForThinking(rawContent);

      if (thinkingBlocks.length === 0) {
        logger.extractor.info(`No thinking blocks found in: ${transcript.filename}`);
        await this.processedLog.recordProcessed(transcript.filename, transcript.sourcePath, contentHash, transcript.lastModified, []);
        return {
          filename: transcript.filename,
          success: true,
          memoriesCreated: [],
        };
      }

      logger.extractor.debug(`Found ${thinkingBlocks.length} thinking blocks in: ${transcript.filename}`);

      // Create thinking memories
      const createdIds: string[] = [];

      for (const thinking of thinkingBlocks) {
        try {
          // Generate subject from thinking content
          const subject = generateSubjectFromContent(thinking.thinking);

          // Combine thinking and output into structured content
          const combinedContent = `## Thought\n\n${thinking.thinking}\n\n## Output\n\n${thinking.output}`;

          // Create thinking memory (always global scope)
          const memory = await this.memoryManager.createMemory({
            subject,
            applies_to: 'global' as MemoryScope,
            content: combinedContent,
            occurred_at: thinking.timestamp,
          });
          createdIds.push(memory.id);
        } catch (error) {
          logger.extractor.error(`Failed to create thinking memory`, error);
        }
      }

      // Record in processed log
      await this.processedLog.recordProcessed(transcript.filename, transcript.sourcePath, contentHash, transcript.lastModified, createdIds);

      logger.extractor.info(`Created ${createdIds.length} thinking memories from: ${transcript.filename}`);

      return {
        filename: transcript.filename,
        success: true,
        memoriesCreated: createdIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.extractor.error(`Failed to process transcript for thinking: ${transcript.filename}`, error);

      return {
        filename: transcript.filename,
        success: false,
        memoriesCreated: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Process all unprocessed transcripts with 20-file concurrent execution
   */
  async processAllTranscripts(): Promise<ThinkingProcessingResult[]> {
    logger.extractor.info('Starting thinking transcript processing run');

    // Sync transcripts from Claude cache
    await this.transcriptCollector.syncTranscripts();

    // Get all local transcripts
    const transcripts = await this.transcriptCollector.listLocalTranscripts();
    logger.extractor.info(`Found ${transcripts.length} transcripts to check for thinking`);

    if (transcripts.length === 0) {
      return [];
    }

    const results: ThinkingProcessingResult[] = [];

    // Process transcripts with concurrency control
    const batchResults = await this.processBatch(transcripts);
    results.push(...batchResults);

    const successful = results.filter((r) => r.success);
    const memoriesCreated = results.reduce((sum, r) => sum + r.memoriesCreated.length, 0);

    logger.extractor.info(`Thinking processing complete: ${successful.length}/${results.length} transcripts, ${memoriesCreated} thinking memories created`);

    return results;
  }

  /**
   * Process a batch of transcripts with 20-file concurrency
   */
  private async processBatch(transcripts: TranscriptInfo[]): Promise<ThinkingProcessingResult[]> {
    const results: ThinkingProcessingResult[] = [];

    // Semaphore for controlling concurrency
    let activeCount = 0;
    const maxConcurrency = this.options.concurrency;
    const waitQueue: (() => void)[] = [];

    const acquire = (): Promise<void> => {
      if (activeCount < maxConcurrency) {
        activeCount++;
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        waitQueue.push(resolve);
      });
    };

    const release = (): void => {
      const next = waitQueue.shift();
      if (next) {
        next();
      } else {
        activeCount--;
      }
    };

    logger.extractor.info(`Processing ${transcripts.length} transcripts with concurrency: ${maxConcurrency}`);

    // Create promises for all transcripts
    const promises = transcripts.map(async (transcript) => {
      await acquire();
      try {
        const result = await this.processTranscript(transcript);
        results.push(result);
        return result;
      } catch (error) {
        const errorResult: ThinkingProcessingResult = {
          filename: transcript.filename,
          success: false,
          memoriesCreated: [],
          error: error instanceof Error ? error.message : String(error),
        };
        results.push(errorResult);
        return errorResult;
      } finally {
        release();
      }
    });

    // Wait for all to complete
    await Promise.all(promises);

    return results;
  }
}

/**
 * Process transcripts for thinking memories in daemon mode (called periodically)
 */
export async function runThinkingExtraction(projectPath?: string): Promise<ThinkingProcessingResult[]> {
  const extractor = new ThinkingExtractor(projectPath);
  return extractor.processAllTranscripts();
}
