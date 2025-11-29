#!/usr/bin/env node
/**
 * Stop Hook
 *
 * This hook is triggered when Claude stops processing.
 * It analyzes the transcript for memory-worthy content and creates/updates memories.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, etc.
 * Output: JSON with optional decision to block continuation
 */

import { promises as fs } from 'node:fs';
import { loadConfig, getConfig } from '../utils/config.js';
import { MemoryManager } from '../core/memory.js';
import { IndexManager } from '../core/index.js';
import { analyzeForMemories, readStdin } from '../utils/transcript.js';
import { logger } from '../utils/logger.js';
import type { TranscriptMessage } from '../core/types.js';

interface StopHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
}

interface TranscriptEntry {
  type: string;
  message?: {
    role: string;
    content: string | Array<{ type: string; text?: string }>;
  };
  timestamp?: string;
}

async function main(): Promise<void> {
  try {
    logger.hooks.info('Stop hook fired');

    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      // No input, nothing to do
      logger.hooks.warn('Stop hook: No stdin input received, exiting');
      process.exit(0);
    }

    let input: StopHookInput;
    try {
      input = JSON.parse(inputRaw) as StopHookInput;
      logger.hooks.info(`Stop hook input received: ${JSON.stringify(input, null, 2)}`);
    } catch (parseError) {
      logger.hooks.error(`Stop hook: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }

    // Use cwd from input
    const projectDir = input.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
    logger.hooks.debug(`Stop hook: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();
    const config = getConfig();
    logger.hooks.debug('Stop hook: Configuration loaded');

    // Read the transcript file
    if (!input.transcript_path) {
      logger.hooks.warn('Stop hook: No transcript_path provided');
      console.error('No transcript_path provided');
      process.exit(0);
    }

    logger.hooks.debug(`Stop hook: Reading transcript from ${input.transcript_path}`);
    let transcriptContent: string;
    try {
      transcriptContent = await fs.readFile(input.transcript_path, 'utf-8');
    } catch (error) {
      logger.hooks.error(`Stop hook: Could not read transcript file: ${String(error)}`);
      console.error('Could not read transcript file:', error);
      process.exit(0);
    }

    // Parse JSONL transcript
    const transcriptLines = transcriptContent
      .split('\n')
      .filter((line) => line.trim());

    const messages: TranscriptMessage[] = [];
    const now = Date.now();
    const timeWindowMs = config.hooks.timeWindow * 1000;

    for (const line of transcriptLines) {
      try {
        const entry = JSON.parse(line) as TranscriptEntry;

        // Look for message entries
        if (entry.type === 'message' && entry.message) {
          const role = entry.message.role as 'user' | 'assistant';
          let content: string;

          // Handle different content formats
          if (typeof entry.message.content === 'string') {
            content = entry.message.content;
          } else if (Array.isArray(entry.message.content)) {
            content = entry.message.content
              .filter((c) => c.type === 'text' && c.text)
              .map((c) => c.text)
              .join('\n');
          } else {
            continue;
          }

          // Check timestamp if available
          const timestamp = entry.timestamp ?? new Date().toISOString();
          const messageTime = new Date(timestamp).getTime();

          // Only include recent messages (within time window)
          if (now - messageTime <= timeWindowMs) {
            messages.push({
              role,
              content,
              timestamp,
            });
          }
        }
      } catch {
        // Skip malformed lines
      }
    }

    logger.hooks.debug(`Stop hook: Parsed ${messages.length} messages from transcript`);

    if (messages.length === 0) {
      // No recent messages to analyze
      logger.hooks.info('Stop hook completed: No recent messages to analyze');
      process.exit(0);
    }

    // Analyze for memory-worthy content
    logger.hooks.debug('Stop hook: Analyzing messages for memory-worthy content');
    const suggestedMemories = analyzeForMemories(messages);

    if (suggestedMemories.length === 0) {
      // No memory-worthy content found
      logger.hooks.info('Stop hook completed: No memory-worthy content found');
      process.exit(0);
    }

    logger.hooks.info(`Stop hook: Found ${suggestedMemories.length} potential memories`);

    // Create memories
    const memoryManager = new MemoryManager();
    const indexManager = new IndexManager();

    const created: string[] = [];

    for (const memoryData of suggestedMemories) {
      try {
        logger.hooks.debug(`Stop hook: Creating memory "${memoryData.subject}"`);
        const memory = await memoryManager.createMemory({
          subject: memoryData.subject,
          keywords: memoryData.keywords,
          applies_to: memoryData.applies_to as 'global' | `file:${string}` | `area:${string}`,
          content: memoryData.content,
        });
        created.push(memory.id);
        logger.hooks.debug(`Stop hook: Created memory ${memory.id}`);
      } catch (error) {
        logger.hooks.error(`Stop hook: Failed to create memory: ${String(error)}`);
        console.error('Failed to create memory:', String(error));
      }
    }

    // Refresh the index if any memories were created
    if (created.length > 0) {
      logger.hooks.debug('Stop hook: Refreshing memory index');
      await indexManager.refreshIndex();
      logger.hooks.info(`Stop hook completed: Created ${created.length} new memories`);
      console.error(`Local Recall: Created ${created.length} new memories`);
    } else {
      logger.hooks.info('Stop hook completed: No memories created');
    }

    // Exit successfully without blocking
    process.exit(0);
  } catch (error) {
    // Log error to stderr
    logger.hooks.error(`Stop hook error: ${String(error)}`);
    console.error('Local Recall stop hook error:', error);
    // Exit 0 to not block
    process.exit(0);
  }
}

main();
