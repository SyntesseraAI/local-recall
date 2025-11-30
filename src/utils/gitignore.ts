import { promises as fs } from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';

const GITIGNORE_CONTENT = `# Local Recall - auto-generated
# These files are regenerated and should not be committed

# Index cache (rebuilt automatically)
index.json

# Debug log
recall.log

# Synced transcripts (local copies, originals in ~/.claude)
transcripts/

# Processed transcript tracking
processed-log.jsonl
`;

/**
 * Ensure .gitignore exists in the local-recall directory with proper exclusions.
 * Creates the directory and file if they don't exist.
 */
export async function ensureGitignore(baseDir: string): Promise<void> {
  const gitignorePath = path.join(baseDir, '.gitignore');

  try {
    await fs.access(gitignorePath);
    // File exists, don't overwrite
  } catch {
    // File doesn't exist, create directory and .gitignore
    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(gitignorePath, GITIGNORE_CONTENT, 'utf-8');
    logger.memory.debug('Created .gitignore in local-recall directory');
  }
}
