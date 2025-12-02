import { spawn } from "node:child_process";
import { MemoryManager } from "./memory.js";
import { ProcessedLogManager } from "./processed-log.js";
import { TranscriptCollector, type TranscriptInfo } from "./transcript-collector.js";
import { condenseTranscriptForExtraction } from "./transcript-condenser.js";
import type { MemoryScope } from "./types.js";
import { buildMemoryExtractionPrompt, extractedMemoriesSchema, type ExtractedMemory } from "../prompts/memory-extraction.js";
import { logger } from "../utils/logger.js";
import { getConfig } from "../utils/config.js";

/**
 * Error thrown when Claude CLI returns a rate limit message
 */
export class RateLimitError extends Error {
  /** Time when the rate limit resets (UTC) */
  resetTime: Date;

  constructor(message: string, resetTime: Date) {
    super(message);
    this.name = "RateLimitError";
    this.resetTime = resetTime;
  }
}

/**
 * Parse rate limit reset time from Claude CLI response
 * Handles formats like "5-hour limit reached - resets 11:30 PM" or "resets in 2 hours"
 * @internal Exported for testing
 */
export function parseRateLimitResetTime(response: string): Date | null {
  // Pattern: "resets [time]" where time can be "11:30 PM", "in 2 hours", etc.
  const resetMatch = response.match(/resets?\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM)?|in\s+\d+\s+(?:hour|minute|min)s?)/i);

  if (!resetMatch || !resetMatch[1]) {
    return null;
  }

  const timeStr = resetMatch[1];
  const now = new Date();

  // Handle "in X hours/minutes" format
  const relativeMatch = timeStr.match(/in\s+(\d+)\s+(hour|minute|min)s?/i);
  if (relativeMatch && relativeMatch[1] && relativeMatch[2]) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    const resetTime = new Date(now);

    if (unit.startsWith("hour")) {
      resetTime.setHours(resetTime.getHours() + amount);
    } else {
      resetTime.setMinutes(resetTime.getMinutes() + amount);
    }

    return resetTime;
  }

  // Handle absolute time format like "11:30 PM"
  const absoluteMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (absoluteMatch && absoluteMatch[1] && absoluteMatch[2]) {
    let hours = parseInt(absoluteMatch[1], 10);
    const minutes = parseInt(absoluteMatch[2], 10);
    const meridiem = absoluteMatch[3]?.toUpperCase();

    // Convert to 24-hour format
    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    const resetTime = new Date(now);
    resetTime.setHours(hours, minutes, 0, 0);

    // If the time is in the past, assume it's tomorrow
    if (resetTime <= now) {
      resetTime.setDate(resetTime.getDate() + 1);
    }

    return resetTime;
  }

  return null;
}

/**
 * Check if response indicates a rate limit and throw RateLimitError if so
 * @internal Exported for testing
 */
export function checkForRateLimit(response: string): void {
  // Check for rate limit indicators
  const rateLimitPatterns = [
    /\d+-hour limit reached/i,
    /rate limit/i,
    /too many requests/i,
    /quota exceeded/i,
  ];

  for (const pattern of rateLimitPatterns) {
    if (pattern.test(response)) {
      const resetTime = parseRateLimitResetTime(response);

      if (resetTime) {
        throw new RateLimitError(
          `Rate limit reached. Resets at ${resetTime.toISOString()}`,
          resetTime
        );
      } else {
        // Default to 1 hour if we can't parse the reset time
        const defaultReset = new Date();
        defaultReset.setHours(defaultReset.getHours() + 1);
        throw new RateLimitError(
          `Rate limit reached. Could not parse reset time, defaulting to 1 hour.`,
          defaultReset
        );
      }
    }
  }
}

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
  /** Maximum concurrent transcript processors */
  concurrency?: number;
}

const DEFAULT_OPTIONS: Required<ExtractorOptions> = {
  maxRetries: 3,
  baseDelay: 2000,
  timeout: 600000, // 10 minutes
  concurrency: 5,
};

/**
 * Memory Extractor - uses Claude CLI to extract memories from transcripts
 */
export class MemoryExtractor {
  private memoryManager: MemoryManager;
  private processedLog: ProcessedLogManager;
  private transcriptCollector: TranscriptCollector;
  private projectPath: string;
  private options: Required<ExtractorOptions>;

  constructor(projectPath?: string, options?: ExtractorOptions) {
    const config = getConfig();
    this.projectPath = projectPath ?? process.cwd();
    this.memoryManager = new MemoryManager(config.memoryDir);
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
   * Uses stdin to pass the prompt to avoid E2BIG errors with large transcripts
   */
  private async callClaudeCLI(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        "-p",
        "-", // Read prompt from stdin
        "--model",
        "haiku",
        "--output-format",
        "json",
        "--max-turns",
        "1",
        "--strict-mcp-config",
      ];

      const child = spawn("claude", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });

      child.on("close", (code) => {
        if (code === 0) {
          // Check for rate limit in successful response
          try {
            checkForRateLimit(stdout);
          } catch (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        } else {
          // Check for rate limit in error output too
          try {
            checkForRateLimit(stderr);
            checkForRateLimit(stdout);
          } catch (error) {
            reject(error);
            return;
          }
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        }
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`Claude CLI timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);

      child.on("close", () => {
        clearTimeout(timeoutId);
      });

      // Write prompt to stdin and close it
      child.stdin?.write(prompt);
      child.stdin?.end();
    });
  }

  /**
   * Call Claude CLI with retry logic
   * Note: RateLimitError is NOT retried - it propagates immediately
   */
  private async callClaudeCLIWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        return await this.callClaudeCLI(prompt);
      } catch (error) {
        // Don't retry rate limit errors - propagate immediately
        if (error instanceof RateLimitError) {
          throw error;
        }

        lastError = error instanceof Error ? error : new Error(String(error));
        logger.extractor.warn(`Claude CLI attempt ${attempt + 1} failed: ${lastError.message}`);

        if (attempt < this.options.maxRetries - 1) {
          const delay = this.options.baseDelay * Math.pow(2, attempt);
          logger.extractor.debug(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError ?? new Error("Claude CLI failed after retries");
  }

  /**
   * Extract text content from Claude CLI JSON output format
   * Claude CLI with --output-format json returns an array of conversation messages
   */
  private extractTextFromClaudeOutput(response: string): string {
    try {
      const parsed = JSON.parse(response);

      // Check if it's the Claude CLI conversation format (array of messages)
      if (Array.isArray(parsed)) {
        // Find the assistant message
        const assistantMessage = parsed.find((msg: { type?: string }) => msg.type === "assistant");

        if (assistantMessage?.message?.content) {
          // Extract text from content array
          const content = assistantMessage.message.content;
          if (Array.isArray(content)) {
            const textBlock = content.find((block: { type?: string }) => block.type === "text");
            if (textBlock?.text) {
              return textBlock.text;
            }
          }
        }

        // Fallback: look for result field in first item
        if (parsed.length > 0 && parsed[0].result) {
          return typeof parsed[0].result === "string" ? parsed[0].result : JSON.stringify(parsed[0].result);
        }
      }

      // Handle single object response
      if (parsed.result) {
        return typeof parsed.result === "string" ? parsed.result : JSON.stringify(parsed.result);
      }

      // Already a plain response, return original
      return response;
    } catch {
      // Not JSON, return as-is
      return response;
    }
  }

  /**
   * Strip markdown code blocks from response
   */
  private stripMarkdownCodeBlocks(text: string): string {
    // Match ```json ... ``` or ``` ... ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      return codeBlockMatch[1].trim();
    }
    return text.trim();
  }

  /**
   * Parse Claude CLI JSON output and extract memories
   */
  private parseClaudeResponse(response: string): ExtractedMemory[] {
    try {
      // Step 1: Extract text content from Claude CLI output format
      let textContent = this.extractTextFromClaudeOutput(response);

      // Step 2: Strip markdown code blocks
      textContent = this.stripMarkdownCodeBlocks(textContent);

      // Step 3: Parse the JSON
      let parsed = JSON.parse(textContent);

      // Handle if the memories are nested in a result field
      if (parsed.result) {
        if (typeof parsed.result === "string") {
          parsed = JSON.parse(parsed.result);
        } else {
          parsed = parsed.result;
        }
      }

      // Handle nested string
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      // Handle if Claude returns array of memories directly instead of { memories: [...] }
      // Only wrap if it looks like memory objects (has subject/keywords), not if it's conversation messages
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        const looksLikeMemory = firstItem.subject || firstItem.title || firstItem.keywords || firstItem.tags;
        if (looksLikeMemory) {
          parsed = { memories: parsed };
        }
      }

      // Normalize field names - Claude might use variations
      if (parsed.memories && Array.isArray(parsed.memories)) {
        parsed.memories = parsed.memories.map((memory: Record<string, unknown>) => ({
          subject: memory.subject ?? memory.title ?? memory.name ?? memory.summary,
          keywords: memory.keywords ?? memory.tags ?? memory.keys,
          applies_to: memory.applies_to ?? memory.appliesTo ?? memory.scope ?? memory.applies,
          content: memory.content ?? memory.body ?? memory.text ?? memory.details ?? memory.description,
        }));
      }

      // Log the parsed structure before validation for debugging
      logger.extractor.debug("Normalized response structure: " + JSON.stringify(parsed, null, 2));

      const validated = extractedMemoriesSchema.parse(parsed);
      return validated.memories;
    } catch (error) {
      logger.extractor.error("Failed to parse Claude response", error);
      logger.extractor.debug("Raw response was: " + response.substring(0, 2000));

      // Try to extract JSON from the response (Claude might include explanation text)
      const jsonMatch = response.match(/\{[\s\S]*"memories"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let extracted = JSON.parse(jsonMatch[0]);
          // Apply same normalization as above
          if (extracted.memories && Array.isArray(extracted.memories)) {
            extracted.memories = extracted.memories.map((memory: Record<string, unknown>) => ({
              subject: memory.subject ?? memory.title ?? memory.name ?? memory.summary,
              keywords: memory.keywords ?? memory.tags ?? memory.keys,
              applies_to: memory.applies_to ?? memory.appliesTo ?? memory.scope ?? memory.applies,
              content: memory.content ?? memory.body ?? memory.text ?? memory.details ?? memory.description,
            }));
          }
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
      const needsProcessing = await this.processedLog.needsProcessing(transcript.filename, contentHash);

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

      // Read transcript content and condense it for extraction
      const rawContent = await this.transcriptCollector.readTranscript(transcript);
      const condensedContent = condenseTranscriptForExtraction(rawContent);

      logger.extractor.debug(`Condensed transcript from ${rawContent.length} to ${condensedContent.length} chars (${Math.round((condensedContent.length / rawContent.length) * 100)}%)`);

      // Build prompt with condensed content
      const prompt = buildMemoryExtractionPrompt(condensedContent, this.projectPath);

      // Call Claude CLI
      const response = await this.callClaudeCLIWithRetry(prompt);

      // Parse response
      const extractedMemories = this.parseClaudeResponse(response);

      if (extractedMemories.length === 0) {
        logger.extractor.info(`No memories extracted from: ${transcript.filename}`);
        await this.processedLog.recordProcessed(transcript.filename, transcript.sourcePath, contentHash, transcript.lastModified, []);
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

      // Record in processed log
      await this.processedLog.recordProcessed(transcript.filename, transcript.sourcePath, contentHash, transcript.lastModified, createdIds);

      logger.extractor.info(`Created ${createdIds.length} memories from: ${transcript.filename}`);

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
   * Process all unprocessed transcripts with concurrent execution
   * Handles rate limits by pausing and resuming after reset time + 5 minutes
   */
  async processAllTranscripts(): Promise<ProcessingResult[]> {
    logger.extractor.info("Starting transcript processing run");

    // Sync transcripts from Claude cache
    await this.transcriptCollector.syncTranscripts();

    // Get all local transcripts
    const transcripts = await this.transcriptCollector.listLocalTranscripts();
    logger.extractor.info(`Found ${transcripts.length} transcripts to check`);

    if (transcripts.length === 0) {
      return [];
    }

    const results: ProcessingResult[] = [];
    let transcriptIndex = 0;

    while (transcriptIndex < transcripts.length) {
      // Process remaining transcripts with concurrency control
      const remainingTranscripts = transcripts.slice(transcriptIndex);
      const batchResults = await this.processBatchWithRateLimitHandling(remainingTranscripts);

      results.push(...batchResults.results);
      transcriptIndex += batchResults.processedCount;

      // If we hit a rate limit, wait and continue
      if (batchResults.rateLimitResetTime) {
        // Add 5 minutes buffer after reset time
        const waitUntil = new Date(batchResults.rateLimitResetTime.getTime() + 5 * 60 * 1000);
        const waitMs = waitUntil.getTime() - Date.now();

        if (waitMs > 0) {
          logger.extractor.info(
            `Rate limit hit. Pausing until ${waitUntil.toISOString()} (${Math.ceil(waitMs / 60000)} minutes)`
          );
          await this.sleep(waitMs);
          logger.extractor.info("Resuming transcript processing after rate limit pause");
        }
      }
    }

    const successful = results.filter((r) => r.success);
    const memoriesCreated = results.reduce((sum, r) => sum + r.memoriesCreated.length, 0);

    logger.extractor.info(`Processing complete: ${successful.length}/${results.length} transcripts, ${memoriesCreated} memories created`);

    return results;
  }

  /**
   * Process a batch of transcripts, stopping on rate limit
   * Returns results and rate limit info if encountered
   */
  private async processBatchWithRateLimitHandling(
    transcripts: TranscriptInfo[]
  ): Promise<{
    results: ProcessingResult[];
    processedCount: number;
    rateLimitResetTime: Date | null;
  }> {
    const results: ProcessingResult[] = [];
    let rateLimitResetTime: Date | null = null;
    let processedCount = 0;

    // Semaphore for controlling concurrency
    let activeCount = 0;
    const maxConcurrency = this.options.concurrency;
    const waitQueue: (() => void)[] = [];
    let stopProcessing = false;

    const acquire = (): Promise<boolean> => {
      if (stopProcessing) {
        return Promise.resolve(false);
      }
      if (activeCount < maxConcurrency) {
        activeCount++;
        return Promise.resolve(true);
      }
      return new Promise((resolve) => {
        waitQueue.push(() => resolve(!stopProcessing));
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

    logger.extractor.info(`Processing batch of ${transcripts.length} transcripts with concurrency: ${maxConcurrency}`);

    // Process transcripts sequentially to properly handle rate limits
    // (concurrent processing would make it hard to track which transcripts completed before rate limit)
    for (const transcript of transcripts) {
      if (stopProcessing) {
        break;
      }

      const acquired = await acquire();
      if (!acquired) {
        break;
      }

      try {
        const result = await this.processTranscript(transcript);
        results.push(result);
        processedCount++;
      } catch (error) {
        if (error instanceof RateLimitError) {
          logger.extractor.warn(`Rate limit reached: ${error.message}`);
          rateLimitResetTime = error.resetTime;
          stopProcessing = true;

          // Don't count this transcript as processed - it needs to be retried
          // Clear the wait queue to stop pending requests
          while (waitQueue.length > 0) {
            const next = waitQueue.shift();
            if (next) next();
          }
          break;
        }

        // Other errors - record as failed but continue
        results.push({
          filename: transcript.filename,
          success: false,
          memoriesCreated: [],
          error: error instanceof Error ? error.message : String(error),
        });
        processedCount++;
      } finally {
        if (!stopProcessing) {
          release();
        }
      }
    }

    return { results, processedCount, rateLimitResetTime };
  }
}

/**
 * Process transcripts in daemon mode (called periodically)
 */
export async function runTranscriptProcessing(projectPath?: string): Promise<ProcessingResult[]> {
  const extractor = new MemoryExtractor(projectPath);
  return extractor.processAllTranscripts();
}
