/**
 * Database utilities for SQLite with concurrency handling
 *
 * Provides retry logic and busy timeout configuration to handle
 * concurrent access from multiple processes (hooks, MCP server daemon).
 */

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { openSync, closeSync, unlinkSync, constants, statSync } from 'node:fs';
import path from 'node:path';
import { logger } from './logger.js';

/** Default busy timeout in milliseconds */
const DEFAULT_BUSY_TIMEOUT = 30000; // 30 seconds

/** Default retry configuration */
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 100;
const DEFAULT_RETRY_BACKOFF = 2;

/** Lock file name for sqlite-vec loading */
const SQLITE_VEC_LOCK_FILE = '.sqlite-vec.lock';

/** Maximum time to wait for lock in milliseconds */
const LOCK_TIMEOUT_MS = 5000;

/** Time between lock acquisition attempts */
const LOCK_RETRY_DELAY_MS = 50;

export interface DatabaseOptions {
  /** Busy timeout in milliseconds (default: 30000) */
  busyTimeout?: number;
  /** Enable WAL mode for better concurrency (default: true) */
  walMode?: boolean;
  /** Open in read-only mode (default: false) - avoids write locks entirely */
  readonly?: boolean;
}

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay between retries in ms (default: 100) */
  retryDelayMs?: number;
  /** Backoff multiplier for each retry (default: 2) */
  backoff?: number;
}

/**
 * Acquire an exclusive file lock to prevent concurrent sqlite-vec loading
 * Returns a release function or null if lock couldn't be acquired
 */
function acquireLock(lockPath: string): (() => void) | null {
  const startTime = Date.now();

  while (Date.now() - startTime < LOCK_TIMEOUT_MS) {
    try {
      // Try to create lock file with exclusive flag (O_EXCL fails if file exists)
      const fd = openSync(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o644);
      closeSync(fd);

      // Return release function
      return () => {
        try {
          unlinkSync(lockPath);
        } catch {
          // Ignore errors during cleanup
        }
      };
    } catch (error) {
      // Lock file exists, wait and retry
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        // Check if lock is stale (older than 30 seconds)
        try {
          const stat = statSync(lockPath);
          const age = Date.now() - stat.mtimeMs;
          if (age > 30000) {
            // Stale lock, remove and retry
            try {
              unlinkSync(lockPath);
            } catch {
              // Ignore
            }
          }
        } catch {
          // Ignore stat errors
        }

        // Busy wait
        const waitUntil = Date.now() + LOCK_RETRY_DELAY_MS;
        while (Date.now() < waitUntil) {
          // Spin
        }
        continue;
      }
      // Other error, give up
      return null;
    }
  }

  // Timeout
  return null;
}

/**
 * Open a SQLite database with proper concurrency settings
 */
export function openDatabase(dbPath: string, options: DatabaseOptions = {}): Database.Database {
  const { busyTimeout = DEFAULT_BUSY_TIMEOUT, walMode = true, readonly = false } = options;

  logger.search.debug(
    `Opening database at ${dbPath} with busyTimeout=${busyTimeout}ms, readonly=${readonly}`
  );

  // Open database with appropriate mode
  // Read-only mode avoids write locks entirely, allowing concurrent readers
  const db = new Database(dbPath, { readonly });

  // Set busy timeout - this makes SQLite wait when the database is locked
  // instead of immediately throwing an error
  db.pragma(`busy_timeout = ${busyTimeout}`);

  // Enable WAL mode for better concurrency - allows readers and writers to
  // work simultaneously without blocking each other
  // Note: WAL mode can only be set by a read-write connection
  if (walMode && !readonly) {
    db.pragma('journal_mode = WAL');
  }

  // Load sqlite-vec extension with file-based locking to prevent concurrent loading
  // which can cause mutex errors in the native code
  const lockPath = path.join(path.dirname(dbPath), SQLITE_VEC_LOCK_FILE);
  const releaseLock = acquireLock(lockPath);

  try {
    sqliteVec.load(db);
  } finally {
    if (releaseLock) {
      releaseLock();
    }
  }

  logger.search.debug('Database opened successfully with sqlite-vec loaded');

  return db;
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a retryable database error (lock/busy related)
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  // Common SQLite lock/busy error patterns
  return (
    message.includes('database is locked') ||
    message.includes('busy') ||
    message.includes('sqlite_busy') ||
    message.includes('sqlite_locked') ||
    message.includes('mutex lock failed') ||
    message.includes('cannot start a transaction')
  );
}

/**
 * Execute a database operation with retry logic for transient lock errors
 */
export async function withRetry<T>(
  operation: () => T | Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    backoff = DEFAULT_RETRY_BACKOFF,
  } = options;

  let lastError: Error | undefined;
  let delay = retryDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw lastError;
      }

      logger.search.warn(
        `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}. Retrying in ${delay}ms...`
      );

      await sleep(delay);
      delay *= backoff;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError ?? new Error('Unknown error in withRetry');
}

/**
 * Execute a synchronous database operation with retry logic
 */
export function withRetrySync<T>(operation: () => T, options: RetryOptions = {}): T {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    backoff = DEFAULT_RETRY_BACKOFF,
  } = options;

  let lastError: Error | undefined;
  let delay = retryDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw lastError;
      }

      logger.search.warn(
        `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}. Retrying in ${delay}ms...`
      );

      // Synchronous sleep using busy-wait (not ideal, but necessary for sync operations)
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait
      }
      delay *= backoff;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError ?? new Error('Unknown error in withRetrySync');
}
