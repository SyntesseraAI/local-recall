import { promises as fs } from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import {
  type Memory,
  type CreateMemoryInput,
  type UpdateMemoryInput,
  type MemoryScope,
  createMemoryInputSchema,
  updateMemoryInputSchema,
  memoryFrontmatterSchema,
} from './types.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { serializeMemory, parseMarkdown } from '../utils/markdown.js';

/**
 * Memory Manager - handles CRUD operations for memory files
 */
export class MemoryManager {
  private memoriesDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    const base = baseDir ?? config.memoryDir;
    this.memoriesDir = path.join(base, 'memories');
  }

  /**
   * Ensure the memories directory exists
   */
  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.memoriesDir, { recursive: true });
  }

  /**
   * Get the file path for a memory by ID
   */
  private getFilePath(id: string): string {
    return path.join(this.memoriesDir, `${id}.md`);
  }

  /**
   * Create a new memory
   */
  async createMemory(input: CreateMemoryInput): Promise<Memory> {
    logger.memory.debug(`Creating memory: "${input.subject}"`);
    const validated = createMemoryInputSchema.parse(input);
    await this.ensureDir();

    const now = new Date().toISOString();
    const id = uuidv4();

    const memory: Memory = {
      id,
      subject: validated.subject,
      keywords: validated.keywords,
      applies_to: validated.applies_to as MemoryScope,
      created_at: now,
      updated_at: now,
      content: validated.content,
    };

    await this.writeMemory(memory);
    logger.memory.info(`Created memory ${id}: "${memory.subject}"`);
    return memory;
  }

  /**
   * Update an existing memory
   */
  async updateMemory(input: UpdateMemoryInput): Promise<Memory> {
    logger.memory.debug(`Updating memory: ${input.id}`);
    const validated = updateMemoryInputSchema.parse(input);
    const existing = await this.getMemory(validated.id);

    if (!existing) {
      logger.memory.warn(`Memory not found for update: ${validated.id}`);
      throw new Error(`Memory with ID ${validated.id} not found`);
    }

    const updated: Memory = {
      ...existing,
      subject: validated.subject ?? existing.subject,
      keywords: validated.keywords ?? existing.keywords,
      applies_to: (validated.applies_to as MemoryScope | undefined) ?? existing.applies_to,
      content: validated.content ?? existing.content,
      updated_at: new Date().toISOString(),
    };

    await this.writeMemory(updated);
    logger.memory.info(`Updated memory ${validated.id}: "${updated.subject}"`);
    return updated;
  }

  /**
   * Delete a memory by ID
   */
  async deleteMemory(id: string): Promise<boolean> {
    logger.memory.debug(`Deleting memory: ${id}`);
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
      logger.memory.info(`Deleted memory: ${id}`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.memory.warn(`Memory not found for deletion: ${id}`);
        return false;
      }
      logger.memory.error(`Failed to delete memory ${id}: ${String(error)}`);
      throw error;
    }
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

    // Sort by updated_at descending
    memories.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Apply pagination
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? memories.length;

    return memories.slice(offset, offset + limit);
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
