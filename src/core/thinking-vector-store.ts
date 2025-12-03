/**
 * Thinking Vector Store - manages SQLite database with vector embeddings for thinking memories
 *
 * Uses the same database as the main vector store but with separate tables.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { type ThinkingMemory, type MemoryScope } from './types.js';
import { EmbeddingService, EMBEDDING_DIM, getEmbeddingService } from './embedding.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';
import { openDatabase } from '../utils/database.js';

/** Database filename (same as main vector store) */
const DB_FILENAME = 'memory.sqlite';

export interface ThinkingVectorStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
  /** Open in read-only mode (default: false) - avoids write locks for search operations */
  readonly?: boolean;
}

/**
 * Thinking Vector Store - manages vector embeddings for thinking memories in SQLite
 */
export class ThinkingVectorStore {
  private db: Database.Database | null = null;
  private embeddingService: EmbeddingService;
  private dbPath: string;
  private baseDir: string;
  private readonly: boolean;

  constructor(options: ThinkingVectorStoreOptions = {}) {
    const config = getConfig();
    this.baseDir = options.baseDir ?? config.memoryDir;
    this.dbPath = path.join(this.baseDir, DB_FILENAME);
    this.embeddingService = getEmbeddingService();
    this.readonly = options.readonly ?? false;
  }

  /**
   * Initialize the database and create tables if needed
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    logger.search.info(`Initializing thinking vector store (readonly=${this.readonly})`);

    // Ensure directory exists and gitignore is set up (only if not readonly)
    if (!this.readonly) {
      await fs.mkdir(this.baseDir, { recursive: true });
      await ensureGitignore(this.baseDir);
    }

    // Initialize embedding service
    await this.embeddingService.initialize();

    // Open database with proper concurrency settings
    this.db = openDatabase(this.dbPath, { readonly: this.readonly });

    // Create tables (only if not readonly)
    if (!this.readonly) {
      this.createTables();
    }

    logger.search.info('Thinking vector store initialized');
  }

  /**
   * Create database tables for thinking memories
   */
  private createTables(): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create metadata table for thinking memory info (no keywords column)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS thinking_memories (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        applies_to TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);

    // Create virtual table for vector search
    // Note: vec0 virtual tables can't use IF NOT EXISTS, so we check first
    const vecTableExists = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='thinking_embeddings'")
      .get();

    if (!vecTableExists) {
      this.db.exec(`
        CREATE VIRTUAL TABLE thinking_embeddings USING vec0(
          id TEXT PRIMARY KEY,
          embedding float[${EMBEDDING_DIM}]
        )
      `);
    }

    // Create index on occurred_at for sorting
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_thinking_memories_occurred_at ON thinking_memories(occurred_at DESC)
    `);

    // Create index on applies_to for filtering
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_thinking_memories_applies_to ON thinking_memories(applies_to)
    `);
  }

  /**
   * Add a thinking memory to the vector store
   */
  async add(memory: ThinkingMemory): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    logger.search.debug(`Adding thinking memory to vector store: ${memory.id}`);

    // Check if memory already exists
    const existing = this.db
      .prepare('SELECT id FROM thinking_memories WHERE id = ?')
      .get(memory.id);

    if (existing) {
      logger.search.debug(`Thinking memory ${memory.id} already exists in vector store`);
      return;
    }

    // Generate embedding for memory content
    // Combine subject and content for better semantic representation
    const textForEmbedding = `${memory.subject}\n\n${memory.content}`;
    const embedding = await this.embeddingService.embed(textForEmbedding);

    // Insert into both tables in a transaction
    const insertMemory = this.db.prepare(`
      INSERT OR REPLACE INTO thinking_memories (id, subject, applies_to, occurred_at, content_hash, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertEmbedding = this.db.prepare(`
      INSERT INTO thinking_embeddings (id, embedding)
      VALUES (?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertMemory.run(
        memory.id,
        memory.subject,
        memory.applies_to,
        memory.occurred_at,
        memory.content_hash,
        memory.content
      );
      insertEmbedding.run(memory.id, JSON.stringify(embedding));
    });

    transaction();
    logger.search.info(`Added thinking memory ${memory.id} to vector store`);
  }

  /**
   * Remove a thinking memory from the vector store
   */
  async remove(id: string): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const deleteMemory = this.db.prepare('DELETE FROM thinking_memories WHERE id = ?');
    const deleteEmbedding = this.db.prepare('DELETE FROM thinking_embeddings WHERE id = ?');

    const transaction = this.db.transaction(() => {
      const result = deleteMemory.run(id);
      deleteEmbedding.run(id);
      return result.changes > 0;
    });

    const deleted = transaction();
    if (deleted) {
      logger.search.info(`Removed thinking memory ${id} from vector store`);
    }
    return deleted;
  }

  /**
   * Search for similar thinking memories using vector similarity
   */
  async search(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {}
  ): Promise<Array<{ memory: ThinkingMemory; score: number }>> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const limit = options.limit ?? 10;

    logger.search.debug(`Thinking vector search for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embedQuery(query);

    // Build the query - sqlite-vec requires 'k = ?' constraint for knn queries
    // Note: scope filtering is done after knn search since sqlite-vec applies k limit before JOINs
    const searchLimit = options.scope ? limit * 10 : limit; // Get more results when filtering by scope
    const sql = `
      SELECT
        m.id, m.subject, m.applies_to, m.occurred_at, m.content_hash, m.content,
        e.distance
      FROM thinking_embeddings e
      JOIN thinking_memories m ON e.id = m.id
      WHERE e.embedding MATCH ? AND k = ?
      ORDER BY e.distance
    `;
    const params = [JSON.stringify(queryEmbedding), searchLimit];

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Array<{
      id: string;
      subject: string;
      applies_to: string;
      occurred_at: string;
      content_hash: string;
      content: string;
      distance: number;
    }>;

    let results = rows.map((row) => ({
      memory: {
        id: row.id,
        subject: row.subject,
        applies_to: row.applies_to as MemoryScope,
        occurred_at: row.occurred_at,
        content_hash: row.content_hash,
        content: row.content,
      },
      // Convert distance to similarity score (lower distance = higher similarity)
      // Using cosine distance, so 0 = identical, 2 = opposite
      // Round to 2 decimal places for cleaner display
      score: Math.round((1 - row.distance / 2) * 100) / 100,
    }));

    // Sort by score descending, then by recency (occurred_at) for equivalent scores
    results.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      // For equal scores, prefer more recent memories
      return new Date(b.memory.occurred_at).getTime() - new Date(a.memory.occurred_at).getTime();
    });

    // Filter by scope if specified (done in code since sqlite-vec applies k limit before JOINs)
    if (options.scope) {
      results = results.filter((r) => r.memory.applies_to === options.scope);
    }

    // Apply the original limit
    results = results.slice(0, limit);

    logger.search.info(`Thinking vector search found ${results.length} results`);
    return results;
  }

  /**
   * Get all thinking memory IDs currently in the store
   */
  async getStoredIds(): Promise<Set<string>> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const rows = this.db.prepare('SELECT id FROM thinking_memories').all() as Array<{ id: string }>;
    return new Set(rows.map((r) => r.id));
  }

  /**
   * Sync vector store with file-based thinking memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories: ThinkingMemory[]): Promise<{ added: number; removed: number }> {
    if (!this.db) {
      await this.initialize();
    }

    logger.search.info(`Syncing thinking vector store with ${memories.length} thinking memories`);

    const storedIds = await this.getStoredIds();
    const fileIds = new Set(memories.map((m) => m.id));

    let added = 0;
    let removed = 0;

    // Add memories that exist in files but not in store
    for (const memory of memories) {
      if (!storedIds.has(memory.id)) {
        await this.add(memory);
        added++;
      }
    }

    // Remove memories that exist in store but not in files
    for (const storedId of storedIds) {
      if (!fileIds.has(storedId)) {
        await this.remove(storedId);
        removed++;
      }
    }

    logger.search.info(`Thinking sync complete: ${added} added, ${removed} removed`);
    return { added, removed };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.search.debug('Thinking vector store closed');
    }
  }
}

/**
 * Singleton thinking vector store instances (separate for readonly and read-write)
 */
let thinkingVectorStoreInstance: ThinkingVectorStore | null = null;
let readonlyThinkingVectorStoreInstance: ThinkingVectorStore | null = null;

/**
 * Get the singleton thinking vector store instance
 *
 * Note: Read-only instances are separate from read-write instances to allow
 * concurrent search operations without mutex conflicts.
 */
export function getThinkingVectorStore(options: ThinkingVectorStoreOptions = {}): ThinkingVectorStore {
  // Use baseDir from options or legacy string parameter support
  const baseDir = typeof options === 'string' ? options : options.baseDir;
  const readonly = typeof options === 'string' ? false : (options.readonly ?? false);

  if (readonly) {
    if (!readonlyThinkingVectorStoreInstance) {
      readonlyThinkingVectorStoreInstance = new ThinkingVectorStore({ baseDir, readonly: true });
    }
    return readonlyThinkingVectorStoreInstance;
  }

  if (!thinkingVectorStoreInstance) {
    thinkingVectorStoreInstance = new ThinkingVectorStore({ baseDir, readonly: false });
  }
  return thinkingVectorStoreInstance;
}

/**
 * Reset the singleton instances (for testing)
 */
export function resetThinkingVectorStore(): void {
  if (thinkingVectorStoreInstance) {
    thinkingVectorStoreInstance.close();
    thinkingVectorStoreInstance = null;
  }
  if (readonlyThinkingVectorStoreInstance) {
    readonlyThinkingVectorStoreInstance.close();
    readonlyThinkingVectorStoreInstance = null;
  }
}
