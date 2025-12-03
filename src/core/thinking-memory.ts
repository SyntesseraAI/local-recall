import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  type ThinkingMemory,
  type CreateThinkingMemoryInput,
  type MemoryScope,
  createThinkingMemoryInputSchema,
  thinkingMemoryFrontmatterSchema,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { serializeThinkingMemory, parseMarkdown } from '../utils/markdown.js';
import { ensureGitignore } from '../utils/gitignore.js';
import { getThinkingVectorStore } from './thinking-vector-store.js';

/**
 * Compute SHA-256 hash of content
 */
function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Generate a subject from thinking content (first ~100 chars, truncated at word boundary)
 */
export function generateSubjectFromContent(content: string, maxLength: number = 100): string {
  const cleaned = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find last word boundary before maxLength
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Thinking Memory Manager - handles CRUD operations for thinking memory files
 */
export class ThinkingMemoryManager {
  private baseDir: string;
  private memoriesDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.memoriesDir = path.join(this.baseDir, 'thinking-memory');
  }

  /**
   * Ensure the memories directory exists and .gitignore is present
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.memoriesDir, { recursive: true });
    await ensureGitignore(this.baseDir);
  }

  /**
   * Get the file path for a memory by ID
   */
  private getFilePath(id: string): string {
    return path.join(this.memoriesDir, `${id}.md`);
  }

  /**
   * Check if a thinking memory with the same occurred_at and content_hash already exists
   */
  async findDuplicate(occurredAt: string, contentHash: string): Promise<ThinkingMemory | null> {
    await this.ensureDir();
    try {
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
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
    return null;
  }

  /**
   * Create a new thinking memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input: CreateThinkingMemoryInput): Promise<ThinkingMemory> {
    logger.memory.debug(`Creating thinking memory: "${input.subject}"`);
    const validated = createThinkingMemoryInputSchema.parse(input);
    await this.ensureDir();

    const now = new Date().toISOString();
    const occurredAt = validated.occurred_at ?? now;
    const contentHash = computeContentHash(validated.content);

    // Check for existing duplicate
    const existing = await this.findDuplicate(occurredAt, contentHash);
    if (existing) {
      logger.memory.info(`Duplicate thinking memory found (${existing.id}), skipping creation`);
      return existing;
    }

    const id = uuidv4();

    const memory: ThinkingMemory = {
      id,
      subject: validated.subject,
      applies_to: validated.applies_to as MemoryScope,
      occurred_at: occurredAt,
      content_hash: contentHash,
      content: validated.content,
    };

    await this.writeMemory(memory);

    // Add to vector store for immediate searchability
    try {
      const vectorStore = getThinkingVectorStore({ baseDir: this.baseDir });
      await vectorStore.add(memory);
    } catch (error) {
      // Log but don't fail - vector store will sync on next startup
      logger.memory.warn(`Failed to add thinking memory to vector store: ${error}`);
    }

    logger.memory.info(`Created thinking memory ${id}: "${memory.subject}"`);
    return memory;
  }

  /**
   * Get a thinking memory by ID
   */
  async getMemory(id: string): Promise<ThinkingMemory | null> {
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
   * List all thinking memories with optional filtering
   */
  async listMemories(filter?: {
    scope?: MemoryScope;
    limit?: number;
    offset?: number;
  }): Promise<ThinkingMemory[]> {
    await this.ensureDir();

    try {
      const files = await fs.readdir(this.memoriesDir);
      const mdFiles = files.filter((f) => f.endsWith('.md'));

      const memories: ThinkingMemory[] = [];

      for (const file of mdFiles) {
        const filePath = path.join(this.memoriesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const memory = this.parseMemory(content);

        if (memory) {
          // Apply filters
          if (filter?.scope && memory.applies_to !== filter.scope) {
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
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Delete a thinking memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);

      // Remove from vector store
      try {
        const vectorStore = getThinkingVectorStore({ baseDir: this.baseDir });
        await vectorStore.remove(id);
      } catch (error) {
        logger.memory.warn(`Failed to remove thinking memory from vector store: ${error}`);
      }

      logger.memory.info(`Deleted thinking memory ${id}`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete all thinking memories for a specific transcript
   * Used when reprocessing a transcript
   */
  async deleteMemoriesForTranscript(transcriptId: string): Promise<number> {
    // This would require storing transcript ID in memories
    // For now, we'll rely on the processed log to handle reprocessing
    logger.memory.debug(`deleteMemoriesForTranscript called for ${transcriptId} (not implemented)`);
    return 0;
  }

  /**
   * Write a thinking memory to disk using the markdown utility
   */
  private async writeMemory(memory: ThinkingMemory): Promise<void> {
    const fileContent = serializeThinkingMemory(memory);
    const filePath = this.getFilePath(memory.id);

    // Write to temp file first, then rename for atomicity
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, fileContent, 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  /**
   * Parse a thinking memory from markdown content using the markdown utility
   */
  private parseMemory(content: string): ThinkingMemory | null {
    try {
      const { frontmatter, body } = parseMarkdown(content);
      const validated = thinkingMemoryFrontmatterSchema.parse(frontmatter);

      return {
        ...validated,
        content: body,
      };
    } catch {
      return null;
    }
  }
}
