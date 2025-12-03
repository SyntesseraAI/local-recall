#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It uses vector similarity search to find relevant memories and adds them to the context.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig, getConfig } from "../utils/config.js";
import { SearchEngine } from "../core/search.js";
import { formatMemoryForDisplay } from "../utils/markdown.js";
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

    // Check if episodic memory is enabled
    const config = getConfig();
    if (!config.episodicEnabled) {
      logger.hooks.debug("UserPromptSubmit: Episodic memory disabled, skipping");
      process.exit(0);
    }

    // Search for relevant memories using vector similarity
    // Use readonly mode to avoid mutex conflicts with concurrent database access
    const searchEngine = new SearchEngine({ readonly: true });
    const results = await searchEngine.search(input.prompt, { limit: 5 });

    if (results.length === 0) {
      logger.hooks.info("UserPromptSubmit: No matching memories found");
      process.exit(0);
    }

    logger.hooks.info(`UserPromptSubmit: Found ${results.length} relevant memories`);

    // Log each memory's details for debugging
    for (const result of results) {
      const similarity = (result.score * 100).toFixed(0);
      logger.hooks.debug(
        `  - ${result.memory.id}.md | ${similarity}% | "${result.memory.subject}"`
      );
    }

    // Build context string for Claude
    const contextParts: string[] = [
      "# Local Recall: Relevant Memories",
      "",
      `Found ${results.length} memories related to your query.`,
      "",
    ];

    for (const result of results) {
      contextParts.push(formatMemoryForDisplay(result.memory));
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
