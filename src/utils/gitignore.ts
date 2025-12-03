import { promises as fs } from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';

const GITIGNORE_CONTENT = `# Local Recall - auto-generated
# These files are regenerated and should not be committed

# Index cache (rebuilt automatically)
index.json

# Orama vector indexes (rebuilt automatically from memory files)
orama-episodic-index.json
orama-thinking-index.json

# Debug log
recall.log

# Synced transcripts (local copies, originals in ~/.claude)
transcripts/

# Processed transcript tracking (memories)
processed-log.jsonl

# Processed transcript tracking (thinking memories)
thinking-processed-log.jsonl
`;

/**
 * Ensure .gitignore exists in the local-recall directory with proper exclusions.
 * Creates the directory and file if they don't exist.
 */
export async function ensureGitignore(baseDir: string): Promise<void> {
  const gitignorePath = path.join(baseDir, '.gitignore');

  await fs.mkdir(baseDir, { recursive: true });

  // Always write the gitignore to ensure it has latest patterns
  // This file is auto-generated so safe to overwrite
  await fs.writeFile(gitignorePath, GITIGNORE_CONTENT, 'utf-8');
  logger.memory.debug('Updated .gitignore in local-recall directory');
}
