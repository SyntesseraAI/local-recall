import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  type Memory,
  type CreateMemoryInput,
  type MemoryScope,
  createMemoryInputSchema,
  memoryFrontmatterSchema,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { serializeMemory, parseMarkdown } from '../utils/markdown.js';

/**
 * Compute SHA-256 hash of content
 */
function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Memory Manager - handles CRUD operations for memory files
 */
export class MemoryManager {
  private baseDir: string;
  private memoriesDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.memoriesDir = path.join(this.baseDir, 'memories');
  }

  /**
   * Ensure the memories directory exists and .gitignore is present
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.memoriesDir, { recursive: true });
    await this.ensureGitignore();
  }

  /**
   * Ensure .gitignore exists with proper exclusions
   */
  private async ensureGitignore(): Promise<void> {
    const gitignorePath = path.join(this.baseDir, '.gitignore');
    const gitignoreContent = `# Local Recall - auto-generated
# These files are regenerated and should not be committed

# Index cache (rebuilt automatically)
index.json

# Debug log
recall.log
`;

    try {
      await fs.access(gitignorePath);
      // File exists, don't overwrite
    } catch {
      // File doesn't exist, create it
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
      logger.memory.debug('Created .gitignore in local-recall directory');
    }
  }

  /**
   * Get the file path for a memory by ID
   */
  private getFilePath(id: string): string {
    return path.join(this.memoriesDir, `${id}.md`);
  }

  /**
   * Check if a memory with the same occurred_at and content_hash already exists
   */
  async findDuplicate(occurredAt: string, contentHash: string): Promise<Memory | null> {
    await this.ensureDir();
    const files = await fs.readdir(this.memoriesDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    for (const file of mdFiles) {
      const filePath = path.join(this.memoriesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const memory = this.parseMemory(content);

      if (memory && memory.occurred_at === occurredAt && memory.content_hash === contentHash) {
        return memory;
      }
    }
    return null;
  }

  /**
   * Create a new memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    logger.memory.debug(`Creating memory: "${input.subject}"`);
    const validated = createMemoryInputSchema.parse(input);
    await this.ensureDir();

    const now = new Date().toISOString();
    const occurredAt = validated.occurred_at ?? now;
    const contentHash = computeContentHash(validated.content);

    // Check for existing duplicate
    const existing = await this.findDuplicate(occurredAt, contentHash);
    if (existing) {
      logger.memory.info(`Duplicate memory found (${existing.id}), skipping creation`);
      return existing;
    }

    const id = uuidv4();

    const memory: Memory = {
      id,
      subject: validated.subject,
      keywords: validated.keywords,
      applies_to: validated.applies_to as MemoryScope,
      occurred_at: occurredAt,
      content_hash: contentHash,
      content: validated.content,
    };

    await this.writeMemory(memory);
    logger.memory.info(`Created memory ${id}: "${memory.subject}"`);
    return memory;
  }

  /**
   * Get a memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    const filePath = this.getFilePath(id);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseMemory(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all memories with optional filtering
   */
  async listMemories(filter?: {
    scope?: MemoryScope;
    keyword?: string;
    limit?: number;
    offset?: number;
  }): Promise<Memory[]> {
    await this.ensureDir();

    const files = await fs.readdir(this.memoriesDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    const memories: Memory[] = [];

    for (const file of mdFiles) {
      const filePath = path.join(this.memoriesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const memory = this.parseMemory(content);

      if (memory) {
        // Apply filters
        if (filter?.scope && memory.applies_to !== filter.scope) {
          continue;
        }
        if (filter?.keyword && !memory.keywords.includes(filter.keyword)) {
          continue;
        }
        memories.push(memory);
      }
    }

    // Sort by occurred_at descending
    memories.sort((a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

    // Apply pagination
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? memories.length;

    return memories.slice(offset, offset + limit);
  }

  /**
   * Delete a memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
      logger.memory.info(`Deleted memory ${id}`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Write a memory to disk using the markdown utility
   */
  private async writeMemory(memory: Memory): Promise<void> {
    const fileContent = serializeMemory(memory);
    const filePath = this.getFilePath(memory.id);

    // Write to temp file first, then rename for atomicity
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, fileContent, 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  /**
   * Parse a memory from markdown content using the markdown utility
   */
  private parseMemory(content: string): Memory | null {
    try {
      const { frontmatter, body } = parseMarkdown(content);
      const validated = memoryFrontmatterSchema.parse(frontmatter);

      return {
        ...validated,
        content: body,
      };
    } catch {
      return null;
    }
  }
}
