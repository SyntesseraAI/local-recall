#!/usr/bin/env node
/**
 * Session Start Hook
 *
 * This hook is triggered when a Claude Code session begins.
 * It loads relevant memories and outputs them for context injection.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig } from '../utils/config.js';
import { IndexManager } from '../core/index.js';
import { SearchEngine } from '../core/search.js';
import { formatMemoryForDisplay } from '../utils/markdown.js';
import { readStdin } from '../utils/transcript.js';

interface SessionStartInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
}

async function main(): Promise<void> {
  try {
    // Read input from stdin
    const inputRaw = await readStdin();
    let input: SessionStartInput | undefined;

    if (inputRaw.trim()) {
      try {
        input = JSON.parse(inputRaw) as SessionStartInput;
      } catch {
        // Input might be empty or invalid, continue anyway
      }
    }

    // Use cwd from input if available, otherwise use PROJECT_DIR env var
    const projectDir = input?.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();

    const indexManager = new IndexManager();
    const searchEngine = new SearchEngine(indexManager);

    // Get context from environment if available
    const context: { files?: string[]; area?: string } = {};

    const contextFiles = process.env['LOCAL_RECALL_CONTEXT_FILES'];
    if (contextFiles) {
      context.files = contextFiles.split(',').map((f) => f.trim());
    }

    const contextArea = process.env['LOCAL_RECALL_CONTEXT_AREA'];
    if (contextArea) {
      context.area = contextArea;
    }

    // Get relevant memories for this session
    const memories = await searchEngine.getRelevantForSession(context);

    if (memories.length === 0) {
      // Output context for Claude
      console.log('# Local Recall: No memories loaded');
      console.log('');
      console.log('No prior memories found for this session. Memories will be created as the session progresses.');
      process.exit(0);
    }

    // Output memories for Claude to consume (stdout goes to context)
    console.log('# Local Recall: Loaded Memories');
    console.log('');
    console.log(`Found ${memories.length} relevant memories for this session.`);
    console.log('');

    for (const memory of memories) {
      console.log(formatMemoryForDisplay(memory));
      console.log('');
      console.log('---');
      console.log('');
    }

    // Output index stats
    const stats = await indexManager.getStats();
    console.log('## Memory Index Status');
    console.log('');
    console.log(`- Total memories: ${stats.memoriesIndexed}`);
    console.log(`- Total keywords: ${stats.keywordsIndexed}`);
    console.log(`- Last indexed: ${stats.builtAt}`);

    // Exit 0 for success
    process.exit(0);
  } catch (error) {
    // Log error to stderr (shown in verbose mode)
    console.error('Local Recall session-start hook error:', error);
    // Exit 0 to not block the session
    process.exit(0);
  }
}

main();
