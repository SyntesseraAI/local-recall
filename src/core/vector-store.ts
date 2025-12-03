/**
 * Vector Store - manages SQLite database with vector embeddings for semantic search
 *
 * Uses better-sqlite3 with sqlite-vec extension for vector similarity search.
 *
 * IMPORTANT: Database connections are ephemeral - opened for each operation and
 * closed immediately after. This prevents "mutex lock failed: Invalid argument"
 * errors that occur when sqlite-vec's internal mutexes are accessed after being
 * destroyed during process exit.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { type Memory, type MemoryScope } from './types.js';
import { EmbeddingService, EMBEDDING_DIM, getEmbeddingService } from './embedding.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ensureGitignore } from '../utils/gitignore.js';
import { openDatabase } from '../utils/database.js';

/** Database filename */
const DB_FILENAME = 'memory.sqlite';

export interface VectorStoreOptions {
  /** Base directory for memory storage */
  baseDir?: string;
  /** Open in read-only mode (default: false) - avoids write locks for search operations */
  readonly?: boolean;
}

/**
 * Vector Store - manages vector embeddings in SQLite
 *
 * Uses ephemeral database connections - each operation opens a fresh connection
 * and closes it when done. This avoids mutex issues on process exit.
 */
export class VectorStore {
  private embeddingService: EmbeddingService;
  private dbPath: string;
  private baseDir: string;
  private readonly: boolean;
  private initialized: boolean = false;

  constructor(options: VectorStoreOptions = {}) {
    const config = getConfig();
    this.baseDir = options.baseDir ?? config.memoryDir;
    this.dbPath = path.join(this.baseDir, DB_FILENAME);
    this.embeddingService = getEmbeddingService();
    this.readonly = options.readonly ?? false;
  }

  /**
   * Initialize the store (ensures directory exists and embedding service is ready)
   * This does NOT open a persistent database connection.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.search.info(`Initializing vector store (readonly=${this.readonly})`);

    // Ensure directory exists and gitignore is set up (only if not readonly)
    if (!this.readonly) {
      await fs.mkdir(this.baseDir, { recursive: true });
      await ensureGitignore(this.baseDir);
    }

    // Initialize embedding service (this can be cached)
    await this.embeddingService.initialize();

    this.initialized = true;
    logger.search.info('Vector store initialized');
  }

  /**
   * Open a database connection for an operation
   * MUST be closed after use to prevent mutex issues
   */
  private openConnection(): Database.Database {
    const db = openDatabase(this.dbPath, { readonly: this.readonly });

    // Create tables if not readonly
    if (!this.readonly) {
      this.createTables(db);
    }

    return db;
  }

  /**
   * Create database tables
   */
  private createTables(db: Database.Database): void {
    // Create metadata table for memory info
    db.exec(`
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
    const vecTableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='memory_embeddings'")
      .get();

    if (!vecTableExists) {
      db.exec(`
        CREATE VIRTUAL TABLE memory_embeddings USING vec0(
          id TEXT PRIMARY KEY,
          embedding float[${EMBEDDING_DIM}]
        )
      `);
    }

    // Create index on occurred_at for sorting
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memories_occurred_at ON memories(occurred_at DESC)
    `);

    // Create index on applies_to for filtering
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memories_applies_to ON memories(applies_to)
    `);
  }

  /**
   * Add a memory to the vector store
   */
  async add(memory: Memory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const db = this.openConnection();
    try {
      logger.search.debug(`Adding memory to vector store: ${memory.id}`);

      // Check if memory already exists
      const existing = db
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
      const insertMemory = db.prepare(`
        INSERT OR REPLACE INTO memories (id, subject, keywords, applies_to, occurred_at, content_hash, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertEmbedding = db.prepare(`
        INSERT INTO memory_embeddings (id, embedding)
        VALUES (?, ?)
      `);

      const transaction = db.transaction(() => {
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
    } finally {
      db.close();
    }
  }

  /**
   * Remove a memory from the vector store
   */
  async remove(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    const db = this.openConnection();
    try {
      const deleteMemory = db.prepare('DELETE FROM memories WHERE id = ?');
      const deleteEmbedding = db.prepare('DELETE FROM memory_embeddings WHERE id = ?');

      const transaction = db.transaction(() => {
        const result = deleteMemory.run(id);
        deleteEmbedding.run(id);
        return result.changes > 0;
      });

      const deleted = transaction();
      if (deleted) {
        logger.search.info(`Removed memory ${id} from vector store`);
      }
      return deleted;
    } finally {
      db.close();
    }
  }

  /**
   * Search for similar memories using vector similarity
   */
  async search(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {}
  ): Promise<Array<{ memory: Memory; score: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const db = this.openConnection();
    try {
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

      const stmt = db.prepare(sql);
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
    } finally {
      db.close();
    }
  }

  /**
   * Get all memory IDs currently in the store
   */
  async getStoredIds(): Promise<Set<string>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const db = this.openConnection();
    try {
      const rows = db.prepare('SELECT id FROM memories').all() as Array<{ id: string }>;
      return new Set(rows.map((r) => r.id));
    } finally {
      db.close();
    }
  }

  /**
   * Sync vector store with file-based memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories: Memory[]): Promise<{ added: number; removed: number }> {
    if (!this.initialized) {
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
   * Close the vector store (no-op since connections are ephemeral)
   * Kept for API compatibility
   */
  close(): void {
    // No-op - connections are now ephemeral and closed after each operation
    logger.search.debug('Vector store close called (no-op with ephemeral connections)');
  }
}

/**
 * Create a new vector store instance
 *
 * Note: Each call creates a new instance. The instance uses ephemeral database
 * connections that are opened and closed for each operation.
 */
export function getVectorStore(options: VectorStoreOptions = {}): VectorStore {
  // Use baseDir from options or legacy string parameter support
  const baseDir = typeof options === 'string' ? options : options.baseDir;
  const readonly = typeof options === 'string' ? false : (options.readonly ?? false);

  return new VectorStore({ baseDir, readonly });
}

/**
 * Reset the vector store (no-op since there's no singleton)
 * Kept for API compatibility with tests
 */
export function resetVectorStore(): void {
  // No-op - there's no singleton to reset anymore
  logger.search.debug('resetVectorStore called (no-op with ephemeral connections)');
}
