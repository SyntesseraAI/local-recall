#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It uses the daemon's HTTP API for search to avoid loading sqlite-vec directly,
 * which prevents "mutex lock failed" errors from concurrent native extension loading.
 *
 * Handles both episodic memories and thinking memories based on configuration:
 * - episodicEnabled: Search episodic memories (facts, decisions, patterns)
 * - thinkingEnabled: Search thinking memories (Claude's previous reasoning)
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig, getConfig } from "../utils/config.js";
import { DaemonClient } from "../utils/daemon-client.js";
import { formatMemoryForDisplay, formatThinkingMemoryForDisplay } from "../utils/markdown.js";
import { readStdin } from "../utils/transcript.js";
import { logger } from "../utils/logger.js";
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
  logger.hooks.info("UserPromptSubmit hook fired");

  try {
    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      logger.hooks.warn("UserPromptSubmit: No stdin input received");
      process.exit(0);
    }

    let input: UserPromptSubmitInput;
    try {
      input = JSON.parse(inputRaw) as UserPromptSubmitInput;
      logger.hooks.debug(`UserPromptSubmit input received for session: ${input.session_id}`);
    } catch {
      logger.hooks.warn(`UserPromptSubmit: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }

    // Check if we have a prompt to process
    if (!input.prompt || input.prompt.trim().length === 0) {
      logger.hooks.debug("UserPromptSubmit: No prompt provided, skipping");
      process.exit(0);
    }

    // Skip internal prompts to avoid recursion (memory extraction prompts, etc.)
    if (input.prompt.includes("[LOCAL_RECALL_INTERNAL]")) {
      logger.hooks.debug("UserPromptSubmit: Skipping internal prompt");
      process.exit(0);
    }

    // Use cwd from input if available
    const projectDir = input.cwd ?? process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
    logger.hooks.debug(`UserPromptSubmit: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env["LOCAL_RECALL_DIR"] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug("UserPromptSubmit: Configuration loaded");

    const config = getConfig();
    const contextParts: string[] = [];

    // Create daemon client (will check if daemon is available)
    const client = new DaemonClient();
    const daemonAvailable = await client.checkDaemon();

    if (!daemonAvailable) {
      logger.hooks.warn("UserPromptSubmit: Daemon not available, skipping search to avoid mutex errors");
      // Exit gracefully - don't load sqlite-vec in hooks anymore
      process.exit(0);
    }

    // Search episodic memories if enabled
    if (config.episodicEnabled) {
      logger.hooks.debug("UserPromptSubmit: Searching episodic memories via daemon");
      try {
        const allResults = await client.searchEpisodic(input.prompt, { limit: 50 });
        const episodicResults = filterByThreshold(
          allResults,
          config.episodicMaxTokens,
          config.episodicMinSimilarity
        );

        if (episodicResults.length > 0) {
          logger.hooks.info(`UserPromptSubmit: Found ${episodicResults.length} episodic memories`);
          for (const result of episodicResults) {
            const similarity = (result.score * 100).toFixed(0);
            logger.hooks.debug(
              `  - ${result.memory.id}.md | ${similarity}% | "${result.memory.subject}"`
            );
          }
          contextParts.push(formatEpisodicResults(episodicResults));
        } else {
          logger.hooks.info(`UserPromptSubmit: No episodic memories above ${(config.episodicMinSimilarity * 100).toFixed(0)}% similarity`);
        }
      } catch (error) {
        logger.hooks.error(`UserPromptSubmit: Episodic search failed: ${String(error)}`);
      }
    } else {
      logger.hooks.debug("UserPromptSubmit: Episodic memory disabled, skipping");
    }

    // Search thinking memories if enabled
    if (config.thinkingEnabled) {
      logger.hooks.debug("UserPromptSubmit: Searching thinking memories via daemon");
      try {
        const allResults = await client.searchThinking(input.prompt, { limit: 50 });
        const thinkingResults = filterThinkingByThreshold(
          allResults,
          config.thinkingMaxTokens,
          config.thinkingMinSimilarity
        );

        if (thinkingResults.length > 0) {
          logger.hooks.info(`UserPromptSubmit: Found ${thinkingResults.length} thinking memories`);
          for (const result of thinkingResults) {
            const similarity = (result.score * 100).toFixed(0);
            logger.hooks.debug(
              `  - ${result.memory.id}.md | ${similarity}% | "${result.memory.subject}"`
            );
          }
          contextParts.push(formatThinkingResults(thinkingResults));
        } else {
          logger.hooks.info(`UserPromptSubmit: No thinking memories above ${(config.thinkingMinSimilarity * 100).toFixed(0)}% similarity`);
        }
      } catch (error) {
        logger.hooks.error(`UserPromptSubmit: Thinking search failed: ${String(error)}`);
      }
    } else {
      logger.hooks.debug("UserPromptSubmit: Thinking memory disabled, skipping");
    }

    // If no results from either search, exit
    if (contextParts.length === 0) {
      logger.hooks.info("UserPromptSubmit: No matching memories found");
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

    logger.hooks.info("UserPromptSubmit hook completed successfully");
    process.exit(0);
  } catch (error) {
    // Log error to stderr (shown in verbose mode)
    logger.hooks.error(`UserPromptSubmit hook error: ${String(error)}`);
    console.error("Local Recall user-prompt-submit hook error:", error);
    // Exit 0 to not block the prompt
    process.exit(0);
  }
}

main();
