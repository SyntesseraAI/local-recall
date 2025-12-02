/**
 * Vector Store - manages SQLite database with vector embeddings for semantic search
 *
 * Uses better-sqlite3 with sqlite-vec extension for vector similarity search.
 */

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { type Memory, type MemoryScope } from './types.js';
import { EmbeddingService, EMBEDDING_DIM, getEmbeddingService } from './embedding.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';

/** Database filename */
const DB_FILENAME = 'memory.sqlite';

/**
 * Vector Store - manages vector embeddings in SQLite
 */
export class VectorStore {
  private db: Database.Database | null = null;
  private embeddingService: EmbeddingService;
  private dbPath: string;
  private baseDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir ?? config.memoryDir;
    this.dbPath = path.join(this.baseDir, DB_FILENAME);
    this.embeddingService = getEmbeddingService();
  }

  /**
   * Initialize the database and create tables if needed
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    logger.search.info('Initializing vector store');

    // Ensure directory exists and gitignore is set up
    await fs.mkdir(this.baseDir, { recursive: true });
    await ensureGitignore(this.baseDir);

    // Initialize embedding service
    await this.embeddingService.initialize();

    // Open database
    this.db = new Database(this.dbPath);

    // Load sqlite-vec extension
    sqliteVec.load(this.db);

    // Create tables
    this.createTables();

    logger.search.info('Vector store initialized');
  }

  /**
   * Create database tables
   */
  private createTables(): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create metadata table for memory info
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        keywords TEXT NOT NULL,
        applies_to TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        content TEXT NOT NULL
      )
    `);

    // Create virtual table for vector search
    // Note: vec0 virtual tables can't use IF NOT EXISTS, so we check first
    const vecTableExists = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='memory_embeddings'")
      .get();

    if (!vecTableExists) {
      this.db.exec(`
        CREATE VIRTUAL TABLE memory_embeddings USING vec0(
          id TEXT PRIMARY KEY,
          embedding float[${EMBEDDING_DIM}]
        )
      `);
    }

    // Create index on occurred_at for sorting
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memories_occurred_at ON memories(occurred_at DESC)
    `);

    // Create index on applies_to for filtering
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memories_applies_to ON memories(applies_to)
    `);
  }

  /**
   * Add a memory to the vector store
   */
  async add(memory: Memory): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    logger.search.debug(`Adding memory to vector store: ${memory.id}`);

    // Check if memory already exists
    const existing = this.db
      .prepare('SELECT id FROM memories WHERE id = ?')
      .get(memory.id);

    if (existing) {
      logger.search.debug(`Memory ${memory.id} already exists in vector store`);
      return;
    }

    // Generate embedding for memory content
    // Combine subject and content for better semantic representation
    const textForEmbedding = `${memory.subject}\n\n${memory.content}`;
    const embedding = await this.embeddingService.embed(textForEmbedding);

    // Insert into both tables in a transaction
    const insertMemory = this.db.prepare(`
      INSERT OR REPLACE INTO memories (id, subject, keywords, applies_to, occurred_at, content_hash, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEmbedding = this.db.prepare(`
      INSERT INTO memory_embeddings (id, embedding)
      VALUES (?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertMemory.run(
        memory.id,
        memory.subject,
        JSON.stringify(memory.keywords),
        memory.applies_to,
        memory.occurred_at,
        memory.content_hash,
        memory.content
      );
      insertEmbedding.run(memory.id, JSON.stringify(embedding));
    });

    transaction();
    logger.search.info(`Added memory ${memory.id} to vector store`);
  }

  /**
   * Remove a memory from the vector store
   */
  async remove(id: string): Promise<boolean> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const deleteMemory = this.db.prepare('DELETE FROM memories WHERE id = ?');
    const deleteEmbedding = this.db.prepare('DELETE FROM memory_embeddings WHERE id = ?');

    const transaction = this.db.transaction(() => {
      const result = deleteMemory.run(id);
      deleteEmbedding.run(id);
      return result.changes > 0;
    });

    const deleted = transaction();
    if (deleted) {
      logger.search.info(`Removed memory ${id} from vector store`);
    }
    return deleted;
  }

  /**
   * Search for similar memories using vector similarity
   */
  async search(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {}
  ): Promise<Array<{ memory: Memory; score: number }>> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const limit = options.limit ?? 10;

    logger.search.debug(`Vector search for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.embedQuery(query);

    // Build the query - sqlite-vec requires 'k = ?' constraint for knn queries
    // Note: scope filtering is done after knn search since sqlite-vec applies k limit before JOINs
    const searchLimit = options.scope ? limit * 10 : limit; // Get more results when filtering by scope
    const sql = `
      SELECT
        m.id, m.subject, m.keywords, m.applies_to, m.occurred_at, m.content_hash, m.content,
        e.distance
      FROM memory_embeddings e
      JOIN memories m ON e.id = m.id
      WHERE e.embedding MATCH ? AND k = ?
      ORDER BY e.distance
    `;
    const params = [JSON.stringify(queryEmbedding), searchLimit];

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Array<{
      id: string;
      subject: string;
      keywords: string;
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
        keywords: JSON.parse(row.keywords) as string[],
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

    logger.search.info(`Vector search found ${results.length} results`);
    return results;
  }

  /**
   * Get all memory IDs currently in the store
   */
  async getStoredIds(): Promise<Set<string>> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const rows = this.db.prepare('SELECT id FROM memories').all() as Array<{ id: string }>;
    return new Set(rows.map((r) => r.id));
  }

  /**
   * Sync vector store with file-based memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories: Memory[]): Promise<{ added: number; removed: number }> {
    if (!this.db) {
      await this.initialize();
    }

    logger.search.info(`Syncing vector store with ${memories.length} memories`);

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

    logger.search.info(`Sync complete: ${added} added, ${removed} removed`);
    return { added, removed };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.search.debug('Vector store closed');
    }
  }
}

/**
 * Singleton vector store instance
 */
let vectorStoreInstance: VectorStore | null = null;

/**
 * Get the singleton vector store instance
 */
export function getVectorStore(baseDir?: string): VectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new VectorStore(baseDir);
  }
  return vectorStoreInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetVectorStore(): void {
  if (vectorStoreInstance) {
    vectorStoreInstance.close();
    vectorStoreInstance = null;
  }
}
