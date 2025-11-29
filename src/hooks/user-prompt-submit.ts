#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It extracts keywords from the prompt, searches for relevant memories,
 * and adds them to the context.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { loadConfig } from '../utils/config.js';
import { IndexManager } from '../core/index.js';
import { SearchEngine } from '../core/search.js';
import { formatMemoryForDisplay } from '../utils/markdown.js';
import { readStdin } from '../utils/transcript.js';
import { logger } from '../utils/logger.js';

// Use require for keyword-extractor due to ESM compatibility
const keywordExtractor = require('keyword-extractor') as {
  extract: (str: string, options?: Record<string, unknown>) => string[];
};

interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  prompt: string;
}

/**
 * Extract keywords from a user prompt using keyword-extractor
 */
function extractKeywords(prompt: string): string[] {
  const extracted = keywordExtractor.extract(prompt, {
    language: 'english',
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: true,
  });

  // Filter out very short keywords and limit to reasonable number
  return extracted.filter((kw: string) => kw.length > 2).slice(0, 10);
}

async function main(): Promise<void> {
  logger.hooks.info('UserPromptSubmit hook fired');

  try {
    // Read input from stdin
    const inputRaw = await readStdin();

    if (!inputRaw.trim()) {
      logger.hooks.warn('UserPromptSubmit: No stdin input received');
      process.exit(0);
    }

    let input: UserPromptSubmitInput;
    try {
      input = JSON.parse(inputRaw) as UserPromptSubmitInput;
      logger.hooks.info(`UserPromptSubmit input received: ${JSON.stringify(input, null, 2)}`);
    } catch {
      logger.hooks.warn(`UserPromptSubmit: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }

    // Check if we have a prompt to process
    if (!input.prompt || input.prompt.trim().length === 0) {
      logger.hooks.debug('UserPromptSubmit: No prompt provided, skipping');
      process.exit(0);
    }

    // Use cwd from input if available
    const projectDir = input.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
    logger.hooks.debug(`UserPromptSubmit: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug('UserPromptSubmit: Configuration loaded');

    // Extract keywords from the prompt
    const keywords = extractKeywords(input.prompt);
    logger.hooks.info(`UserPromptSubmit: Extracted keywords: ${keywords.join(', ')}`);

    if (keywords.length === 0) {
      logger.hooks.debug('UserPromptSubmit: No keywords extracted from prompt');
      process.exit(0);
    }

    // Search for relevant memories
    const indexManager = new IndexManager();
    const searchEngine = new SearchEngine(indexManager);

    const query = keywords.join(' ');
    const results = await searchEngine.searchByKeywords(query, { limit: 5 });

    if (results.length === 0) {
      logger.hooks.info('UserPromptSubmit: No matching memories found');
      process.exit(0);
    }

    logger.hooks.info(`UserPromptSubmit: Found ${results.length} relevant memories`);

    // Build context string for Claude
    const contextParts: string[] = [
      '# Local Recall: Relevant Memories',
      '',
      `Found ${results.length} memories related to your query.`,
      '',
    ];

    for (const result of results) {
      contextParts.push(formatMemoryForDisplay(result.memory));
      contextParts.push(`*Match score: ${(result.score * 100).toFixed(0)}% | Keywords: ${result.matchedKeywords.join(', ')}*`);
      contextParts.push('');
      contextParts.push('---');
      contextParts.push('');
    }

    const additionalContext = contextParts.join('\n');

    // Output as structured JSON for Claude Code hooks
    const output = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext,
      },
    };

    console.log(JSON.stringify(output));

    logger.hooks.info('UserPromptSubmit hook completed successfully');
    process.exit(0);
  } catch (error) {
    // Log error to stderr (shown in verbose mode)
    logger.hooks.error(`UserPromptSubmit hook error: ${String(error)}`);
    console.error('Local Recall user-prompt-submit hook error:', error);
    // Exit 0 to not block the prompt
    process.exit(0);
  }
}

main();
