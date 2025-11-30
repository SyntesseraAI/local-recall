#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 *
 * This hook is triggered when a user submits a prompt, before Claude processes it.
 * It extracts keywords from the prompt using Claude Haiku, searches for relevant memories,
 * and adds them to the context.
 *
 * Input (via stdin): JSON with session_id, transcript_path, cwd, prompt, etc.
 * Output: stdout text is added to Claude's context
 */

import { spawn } from 'node:child_process';
import { loadConfig } from '../utils/config.js';
import { IndexManager } from '../core/index.js';
import { SearchEngine } from '../core/search.js';
import { formatMemoryForDisplay } from '../utils/markdown.js';
import { readStdin } from '../utils/transcript.js';
import { logger } from '../utils/logger.js';

interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  prompt: string;
}

/**
 * Call Claude CLI with haiku model to extract keywords
 */
async function callClaudeForKeywords(text: string): Promise<string[]> {
  return new Promise((resolve) => {
    // Use [LOCAL_RECALL_INTERNAL] token to identify internal extraction calls
    const prompt = `[LOCAL_RECALL_INTERNAL] Extract keywords from this text and return only the keywords as a JSON array of strings. No explanation, just the JSON array:\n\n${text}`;
    const args = ['-p', prompt, '--model', 'haiku', '--output-format', 'json', '--strict-mcp-config'];

    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const safeResolve = (value: string[]) => {
      if (!resolved) {
        resolved = true;
        if (timeoutId) clearTimeout(timeoutId);
        resolve(value);
      }
    };

    logger.hooks.debug('UserPromptSubmit: About to spawn Claude CLI for keyword extraction');

    let child;
    try {
      child = spawn('claude', args, {
        // Use 'ignore' for stdin - Claude CLI hangs if stdin is piped but not written to
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      logger.hooks.debug(`UserPromptSubmit: Claude CLI spawned with PID ${child.pid}`);
    } catch (error) {
      // Handle spawn errors (including AbortError)
      logger.hooks.warn(`Failed to spawn Claude CLI: ${error}`);
      // Return empty array immediately - we need to resolve outside of catch
      setTimeout(() => resolve([]), 0);
      return;
    }

    // Handle case where spawn returns but child is undefined/null
    if (!child) {
      logger.hooks.warn('Claude CLI spawn returned null/undefined');
      setTimeout(() => resolve([]), 0);
      return;
    }

    // Set timeout after successful spawn - use 20s to be well under the 30s hook timeout
    timeoutId = setTimeout(() => {
      logger.hooks.warn('Claude CLI timed out for keyword extraction (20s)');
      child.kill('SIGTERM');
      safeResolve([]);
    }, 20000);

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      logger.hooks.warn(`Claude CLI error: ${error.message}`);
      safeResolve([]);
    });

    child.on('close', (code) => {
      if (resolved) return;

      if (code !== 0) {
        logger.hooks.warn(`Claude CLI exited with code ${code}: ${stderr}`);
        safeResolve([]);
        return;
      }

      try {
        // Parse the JSON response
        let parsed = JSON.parse(stdout);

        // Handle different response formats from Claude CLI
        if (parsed.result) {
          if (typeof parsed.result === 'string') {
            parsed = JSON.parse(parsed.result);
          } else {
            parsed = parsed.result;
          }
        }

        // Extract array from response
        if (Array.isArray(parsed)) {
          safeResolve(parsed.filter((k: unknown) => typeof k === 'string' && k.length > 2).slice(0, 10));
        } else if (typeof parsed === 'string') {
          // Try parsing again if it's a stringified array
          const inner = JSON.parse(parsed);
          if (Array.isArray(inner)) {
            safeResolve(inner.filter((k: unknown) => typeof k === 'string' && k.length > 2).slice(0, 10));
          } else {
            safeResolve([]);
          }
        } else {
          safeResolve([]);
        }
      } catch (error) {
        // Try to extract JSON array from response text
        const match = stdout.match(/\[[\s\S]*?\]/);
        if (match) {
          try {
            const arr = JSON.parse(match[0]);
            if (Array.isArray(arr)) {
              safeResolve(arr.filter((k: unknown) => typeof k === 'string' && k.length > 2).slice(0, 10));
              return;
            }
          } catch {
            // Ignore parsing error
          }
        }
        logger.hooks.warn(`Failed to parse keywords from Claude response: ${error}`);
        safeResolve([]);
      }
    });
  });
}

/**
 * Extract keywords from a user prompt using Claude Haiku
 */
async function extractKeywords(prompt: string): Promise<string[]> {
  return callClaudeForKeywords(prompt);
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

    // Skip prompts that are internal Local Recall calls to prevent recursion
    if (input.prompt.startsWith('[LOCAL_RECALL_INTERNAL]')) {
      logger.hooks.debug('UserPromptSubmit: Skipping internal Local Recall prompt to prevent recursion');
      process.exit(0);
    }

    // Use cwd from input if available
    const projectDir = input.cwd ?? process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();
    logger.hooks.debug(`UserPromptSubmit: Using project directory: ${projectDir}`);

    // Load configuration with the correct base directory
    process.env['LOCAL_RECALL_DIR'] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug('UserPromptSubmit: Configuration loaded');

    // Extract keywords from the prompt using Claude Haiku
    const keywords = await extractKeywords(input.prompt);
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
      `Found ${results.length} memories related to your query (sorted by most recent first).`,
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
