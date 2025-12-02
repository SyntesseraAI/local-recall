#!/usr/bin/env node
/**
 * UserPromptSubmit Hook for Thinking Memories
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It uses vector similarity search to find relevant thinking memories (Claude's
 * previous thought processes) and adds them to the context as "Previous Thoughts".
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig, getConfig } from "../utils/config.js";
import { ThinkingSearchEngine } from "../core/thinking-search.js";
import { formatThinkingMemoryForDisplay } from "../utils/markdown.js";
import { readStdin } from "../utils/transcript.js";
import { logger } from "../utils/logger.js";

interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  prompt: string;
}

async function main(): Promise<void> {
  logger.hooks.info("UserPromptSubmit thinking hook fired");

  try {
    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      logger.hooks.warn("UserPromptSubmit thinking: No stdin input received");
      process.exit(0);
    }

    let input: UserPromptSubmitInput;
    try {
      input = JSON.parse(inputRaw) as UserPromptSubmitInput;
      logger.hooks.debug(`UserPromptSubmit thinking input received for session: ${input.session_id}`);
    } catch {
      logger.hooks.warn(`UserPromptSubmit thinking: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }

    // Check if we have a prompt to process
    if (!input.prompt || input.prompt.trim().length === 0) {
      logger.hooks.debug("UserPromptSubmit thinking: No prompt provided, skipping");
      process.exit(0);
    }

    // Skip internal prompts to avoid recursion (memory extraction prompts, etc.)
    if (input.prompt.includes("[LOCAL_RECALL_INTERNAL]")) {
      logger.hooks.debug("UserPromptSubmit thinking: Skipping internal prompt");
      process.exit(0);
    }

    // Use cwd from input if available
    const projectDir = input.cwd ?? process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
    logger.hooks.debug(`UserPromptSubmit thinking: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env["LOCAL_RECALL_DIR"] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug("UserPromptSubmit thinking: Configuration loaded");

    // Check if thinking memory is enabled
    const config = getConfig();
    if (!config.thinkingEnabled) {
      logger.hooks.debug("UserPromptSubmit thinking: Thinking memory disabled, skipping");
      process.exit(0);
    }

    // Search for relevant thinking memories using vector similarity
    const searchEngine = new ThinkingSearchEngine();
    const results = await searchEngine.search(input.prompt, { limit: 5 });

    if (results.length === 0) {
      logger.hooks.info("UserPromptSubmit thinking: No matching thinking memories found");
      process.exit(0);
    }

    logger.hooks.info(`UserPromptSubmit thinking: Found ${results.length} relevant thinking memories`);

    // Build context string for Claude
    const contextParts: string[] = [
      "# Local Recall: Previous Thoughts",
      "",
      `Found ${results.length} relevant thinking excerpts from previous sessions.`,
      "",
    ];

    for (const result of results) {
      contextParts.push(formatThinkingMemoryForDisplay(result.memory));
      contextParts.push(`*Similarity: ${(result.score * 100).toFixed(0)}%*`);
      contextParts.push("");
      contextParts.push("---");
      contextParts.push("");
    }

    const additionalContext = contextParts.join("\n");

    // Output as structured JSON for Claude Code hooks
    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext,
      },
    };

    console.log(JSON.stringify(output));

    logger.hooks.info("UserPromptSubmit thinking hook completed successfully");
    process.exit(0);
  } catch (error) {
    // Log error to stderr (shown in verbose mode)
    logger.hooks.error(`UserPromptSubmit thinking hook error: ${String(error)}`);
    console.error("Local Recall user-prompt-submit-thinking hook error:", error);
    // Exit 0 to not block the prompt
    process.exit(0);
  }
}

main();
