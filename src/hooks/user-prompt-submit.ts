#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It searches both episodic and thinking memories using Orama (pure JavaScript).
 *
 * Handles both episodic memories and thinking memories based on configuration:
 * - episodicEnabled: Search episodic memories (facts, decisions, patterns)
 * - thinkingEnabled: Search thinking memories (Claude's previous reasoning)
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig, getConfig } from "../utils/config.js";
import { formatMemoryForDisplay, formatThinkingMemoryForDisplay } from "../utils/markdown.js";
import { readStdin } from "../utils/transcript.js";
import { logger } from "../utils/logger.js";
import { SearchEngine } from "../core/search.js";
import { ThinkingSearchEngine } from "../core/thinking-search.js";
import { MemoryManager } from "../core/memory.js";
import type { SearchResult, ThinkingSearchResult } from "../core/types.js";

interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  prompt: string;
}

const CHARS_PER_TOKEN = 4;

function filterByThreshold(
  results: SearchResult[],
  maxTokens: number,
  minSimilarity: number
): SearchResult[] {
  let totalTokens = 0;
  const filtered: SearchResult[] = [];

  for (const result of results) {
    if (result.score < minSimilarity) {
      continue;
    }

    const memoryTokens = Math.ceil(result.memory.content.length / CHARS_PER_TOKEN);

    if (totalTokens + memoryTokens > maxTokens) {
      break;
    }

    filtered.push(result);
    totalTokens += memoryTokens;
  }

  return filtered;
}

function filterThinkingByThreshold(
  results: ThinkingSearchResult[],
  maxTokens: number,
  minSimilarity: number
): ThinkingSearchResult[] {
  let totalTokens = 0;
  const filtered: ThinkingSearchResult[] = [];

  for (const result of results) {
    if (result.score < minSimilarity) {
      continue;
    }

    const memoryTokens = Math.ceil(result.memory.content.length / CHARS_PER_TOKEN);

    if (totalTokens + memoryTokens > maxTokens) {
      break;
    }

    filtered.push(result);
    totalTokens += memoryTokens;
  }

  return filtered;
}

function formatEpisodicResults(results: SearchResult[]): string {
  const parts: string[] = [
    "# Local Recall: Relevant Memories",
    "",
    `Found ${results.length} memories related to your query.`,
    "",
  ];

  for (const result of results) {
    parts.push(formatMemoryForDisplay(result.memory));
    parts.push(`*Similarity: ${(result.score * 100).toFixed(0)}%*`);
    parts.push("");
    parts.push("---");
    parts.push("");
  }

  return parts.join("\n");
}

function formatThinkingResults(results: ThinkingSearchResult[]): string {
  const parts: string[] = [
    "# Local Recall: Previous Thoughts",
    "",
    `Found ${results.length} relevant thinking excerpts from previous sessions.`,
    "",
  ];

  for (const result of results) {
    parts.push(formatThinkingMemoryForDisplay(result.memory));
    parts.push(`*Similarity: ${(result.score * 100).toFixed(0)}%*`);
    parts.push("");
    parts.push("---");
    parts.push("");
  }

  return parts.join("\n");
}

async function main(): Promise<void> {
  const pid = process.pid;
  const hookStartTime = Date.now();

  logger.hooks.info(`[PID:${pid}] UserPromptSubmit hook fired`);

  try {
    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      logger.hooks.warn(`[PID:${pid}] UserPromptSubmit: No stdin input received`);
      process.exit(0);
    }

    let input: UserPromptSubmitInput;
    try {
      input = JSON.parse(inputRaw) as UserPromptSubmitInput;
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit input received for session: ${input.session_id}`);
    } catch {
      logger.hooks.warn(`[PID:${pid}] UserPromptSubmit: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }

    // Check if we have a prompt to process
    if (!input.prompt || input.prompt.trim().length === 0) {
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: No prompt provided, skipping`);
      process.exit(0);
    }

    // Skip internal prompts to avoid recursion (memory extraction prompts, etc.)
    if (input.prompt.includes("[LOCAL_RECALL_INTERNAL]")) {
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Skipping internal prompt`);
      process.exit(0);
    }

    // Use cwd from input if available
    const projectDir = input.cwd ?? process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
    logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env["LOCAL_RECALL_DIR"] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Configuration loaded (${Date.now() - hookStartTime}ms elapsed)`);

    const config = getConfig();
    const contextParts: string[] = [];

    // Search episodic memories if enabled
    if (config.episodicEnabled) {
      const episodicStartTime = Date.now();
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Searching episodic memories`);
      try {
        const memoryManager = new MemoryManager(config.memoryDir);
        const searchEngine = new SearchEngine({ memoryManager, readonly: false });
        logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: SearchEngine created, starting search`);
        const allResults = await searchEngine.search(input.prompt, { limit: 50 });
        const episodicSearchTime = Date.now() - episodicStartTime;
        logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Episodic search completed in ${episodicSearchTime}ms, found ${allResults.length} raw results`);

        const episodicResults = filterByThreshold(
          allResults,
          config.episodicMaxTokens,
          config.episodicMinSimilarity
        );

        if (episodicResults.length > 0) {
          logger.hooks.info(`[PID:${pid}] UserPromptSubmit: Found ${episodicResults.length} episodic memories (${episodicSearchTime}ms)`);
          for (const result of episodicResults) {
            const similarity = (result.score * 100).toFixed(0);
            logger.hooks.debug(
              `  - ${result.memory.id}.md | ${similarity}% | "${result.memory.subject}"`
            );
          }
          contextParts.push(formatEpisodicResults(episodicResults));
        } else {
          logger.hooks.info(`[PID:${pid}] UserPromptSubmit: No episodic memories above ${(config.episodicMinSimilarity * 100).toFixed(0)}% similarity (${episodicSearchTime}ms)`);
        }
      } catch (error) {
        const episodicSearchTime = Date.now() - episodicStartTime;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        logger.hooks.error(`[PID:${pid}] UserPromptSubmit: Episodic search failed after ${episodicSearchTime}ms: ${errorMsg}`);
        if (stack) {
          logger.hooks.error(`[PID:${pid}] Episodic search stack trace: ${stack}`);
        }
      }
    } else {
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Episodic memory disabled, skipping`);
    }

    // Search thinking memories if enabled
    if (config.thinkingEnabled) {
      const thinkingStartTime = Date.now();
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Searching thinking memories`);
      try {
        const thinkingSearchEngine = new ThinkingSearchEngine({ readonly: false, baseDir: config.memoryDir });
        logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: ThinkingSearchEngine created, starting search`);
        const allResults = await thinkingSearchEngine.search(input.prompt, { limit: 50 });
        const thinkingSearchTime = Date.now() - thinkingStartTime;
        logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Thinking search completed in ${thinkingSearchTime}ms, found ${allResults.length} raw results`);

        const thinkingResults = filterThinkingByThreshold(
          allResults,
          config.thinkingMaxTokens,
          config.thinkingMinSimilarity
        );

        if (thinkingResults.length > 0) {
          logger.hooks.info(`[PID:${pid}] UserPromptSubmit: Found ${thinkingResults.length} thinking memories (${thinkingSearchTime}ms)`);
          for (const result of thinkingResults) {
            const similarity = (result.score * 100).toFixed(0);
            logger.hooks.debug(
              `  - ${result.memory.id}.md | ${similarity}% | "${result.memory.subject}"`
            );
          }
          contextParts.push(formatThinkingResults(thinkingResults));
        } else {
          logger.hooks.info(`[PID:${pid}] UserPromptSubmit: No thinking memories above ${(config.thinkingMinSimilarity * 100).toFixed(0)}% similarity (${thinkingSearchTime}ms)`);
        }
      } catch (error) {
        const thinkingSearchTime = Date.now() - thinkingStartTime;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        logger.hooks.error(`[PID:${pid}] UserPromptSubmit: Thinking search failed after ${thinkingSearchTime}ms: ${errorMsg}`);
        if (stack) {
          logger.hooks.error(`[PID:${pid}] Thinking search stack trace: ${stack}`);
        }
      }
    } else {
      logger.hooks.debug(`[PID:${pid}] UserPromptSubmit: Thinking memory disabled, skipping`);
    }

    // If no results from either search, exit
    if (contextParts.length === 0) {
      const totalTime = Date.now() - hookStartTime;
      logger.hooks.info(`[PID:${pid}] UserPromptSubmit: No matching memories found (${totalTime}ms total)`);
      process.exit(0);
    }

    const additionalContext = contextParts.join("\n\n");

    // Output as structured JSON for Claude Code hooks
    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext,
      },
    };

    console.log(JSON.stringify(output));

    const totalTime = Date.now() - hookStartTime;
    logger.hooks.info(`[PID:${pid}] UserPromptSubmit hook completed successfully (${totalTime}ms total)`);
    process.exit(0);
  } catch (error) {
    const totalTime = Date.now() - hookStartTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    // Log detailed error to file
    logger.hooks.error(`[PID:${pid}] UserPromptSubmit hook FATAL ERROR after ${totalTime}ms: ${errorMsg}`);
    if (stack) {
      logger.hooks.error(`[PID:${pid}] Fatal stack trace: ${stack}`);
    }

    // Log error to stderr (shown in verbose mode)
    console.error(`Local Recall user-prompt-submit hook error [PID:${pid}]:`, error);
    // Exit 0 to not block the prompt
    process.exit(0);
  }
}

main();
