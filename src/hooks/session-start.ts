#!/usr/bin/env node
/**
 * Session Start Hook
 *
 * This hook is triggered when a Claude Code session begins.
 * It loads recent memories and outputs them for context injection.
 *
 * This hook uses file-based memory access only (MemoryManager) and does not
 * require sqlite-vec since it only needs to list recent memories, not search.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig, getConfig } from '../utils/config.js';
import { formatMemoryForDisplay, formatThinkingMemoryForDisplay } from '../utils/markdown.js';
import { readStdin } from '../utils/transcript.js';
import { logger } from '../utils/logger.js';
import { MemoryManager } from '../core/memory.js';
import { ThinkingMemoryManager } from '../core/thinking-memory.js';
import type { Memory, ThinkingMemory } from '../core/types.js';

interface SessionStartInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
}

async function main(): Promise<void> {
  logger.hooks.info('SessionStart hook fired');

  try {
    // Read input from stdin
    const inputRaw = await readStdin();
    let input: SessionStartInput | undefined;

    if (inputRaw.trim()) {
      try {
        input = JSON.parse(inputRaw) as SessionStartInput;
        logger.hooks.info(`SessionStart input received: ${JSON.stringify(input, null, 2)}`);
      } catch {
        logger.hooks.warn(`SessionStart: Failed to parse stdin input: ${inputRaw}`);
        // Input might be empty or invalid, continue anyway
      }
    } else {
      logger.hooks.debug('SessionStart: No stdin input received');
    }

    // Use cwd from input if available, otherwise use PROJECT_DIR env var
    const projectDir = input?.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
    logger.hooks.debug(`SessionStart: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug('SessionStart: Configuration loaded');

    const config = getConfig();

    // Check if both memory types are disabled
    if (!config.episodicEnabled && !config.thinkingEnabled) {
      logger.hooks.debug('SessionStart: Both episodic and thinking memories disabled, skipping');
      process.exit(0);
    }

    // Load episodic memories if enabled
    let episodicMemories: Memory[] = [];
    let totalEpisodic = 0;
    if (config.episodicEnabled) {
      logger.hooks.debug('SessionStart: Reading episodic memories from files');
      const memoryManager = new MemoryManager(config.memoryDir);
      const allEpisodic = await memoryManager.listMemories();
      totalEpisodic = allEpisodic.length;
      episodicMemories = allEpisodic
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
        .slice(0, 5);
      logger.hooks.info(`SessionStart: Found ${episodicMemories.length} recent episodic memories`);
    }

    // Load thinking memories if enabled
    let thinkingMemories: ThinkingMemory[] = [];
    let totalThinking = 0;
    if (config.thinkingEnabled) {
      logger.hooks.debug('SessionStart: Reading thinking memories from files');
      const thinkingManager = new ThinkingMemoryManager(config.memoryDir);
      const allThinking = await thinkingManager.listMemories();
      totalThinking = allThinking.length;
      thinkingMemories = allThinking
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
        .slice(0, 5);
      logger.hooks.info(`SessionStart: Found ${thinkingMemories.length} recent thinking memories`);
    }

    if (episodicMemories.length === 0 && thinkingMemories.length === 0) {
      console.log('# Local Recall: No memories loaded');
      console.log('');
      console.log('No prior memories found for this session. Memories will be created as the session progresses.');
      logger.hooks.info('SessionStart hook completed (no memories)');
      process.exit(0);
    }

    // Output episodic memories
    if (episodicMemories.length > 0) {
      console.log('# Local Recall: Recent Memories');
      console.log('');
      console.log(`Found ${episodicMemories.length} recent episodic memories for context.`);
      console.log('');

      for (const memory of episodicMemories) {
        console.log(formatMemoryForDisplay(memory));
        console.log('');
        console.log('---');
        console.log('');
      }
    }

    // Output thinking memories
    if (thinkingMemories.length > 0) {
      console.log('# Local Recall: Recent Thoughts');
      console.log('');
      console.log(`Found ${thinkingMemories.length} recent thinking memories for context.`);
      console.log('');

      for (const memory of thinkingMemories) {
        console.log(formatThinkingMemoryForDisplay(memory));
        console.log('');
        console.log('---');
        console.log('');
      }
    }

    // Output memory stats
    console.log('## Memory Status');
    console.log('');
    if (config.episodicEnabled) {
      console.log(`- Total episodic memories: ${totalEpisodic}`);
    }
    if (config.thinkingEnabled) {
      console.log(`- Total thinking memories: ${totalThinking}`);
    }

    // Exit 0 for success
    logger.hooks.info('SessionStart hook completed successfully');
    process.exit(0);
  } catch (error) {
    // Log error to stderr (shown in verbose mode)
    logger.hooks.error(`SessionStart hook error: ${String(error)}`);
    console.error('Local Recall session-start hook error:', error);
    // Exit 0 to not block the session
    process.exit(0);
  }
}

main();
