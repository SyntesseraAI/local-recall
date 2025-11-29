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
    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      // No input, nothing to do
      process.exit(0);
    }

    const input = JSON.parse(inputRaw) as StopHookInput;

    // Use cwd from input
    const projectDir = input.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();
    const config = getConfig();

    // Read the transcript file
    if (!input.transcript_path) {
      console.error('No transcript_path provided');
      process.exit(0);
    }

    let transcriptContent: string;
    try {
      transcriptContent = await fs.readFile(input.transcript_path, 'utf-8');
    } catch (error) {
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

    if (messages.length === 0) {
      // No recent messages to analyze
      process.exit(0);
    }

    // Analyze for memory-worthy content
    const suggestedMemories = analyzeForMemories(messages);

    if (suggestedMemories.length === 0) {
      // No memory-worthy content found
      process.exit(0);
    }

    // Create memories
    const memoryManager = new MemoryManager();
    const indexManager = new IndexManager();

    const created: string[] = [];

    for (const memoryData of suggestedMemories) {
      try {
        const memory = await memoryManager.createMemory({
          subject: memoryData.subject,
          keywords: memoryData.keywords,
          applies_to: memoryData.applies_to as 'global' | `file:${string}` | `area:${string}`,
          content: memoryData.content,
        });
        created.push(memory.id);
      } catch (error) {
        console.error('Failed to create memory:', String(error));
      }
    }

    // Refresh the index if any memories were created
    if (created.length > 0) {
      await indexManager.refreshIndex();
      console.error(`Local Recall: Created ${created.length} new memories`);
    }

    // Exit successfully without blocking
    process.exit(0);
  } catch (error) {
    // Log error to stderr
    console.error('Local Recall stop hook error:', error);
    // Exit 0 to not block
    process.exit(0);
  }
}

main();
