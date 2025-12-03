/**
 * Daemon Client - HTTP client for hooks to communicate with the daemon
 *
 * Instead of loading sqlite-vec directly (which causes mutex errors when
 * multiple processes load it), hooks use this client to send requests to
 * the daemon's HTTP server.
 */

import http from 'node:http';
import { getConfig } from './config.js';
import { logger } from './logger.js';
import type { Memory, SearchResult, ThinkingSearchResult, MemoryScope } from '../core/types.js';

/** Default timeout for HTTP requests in milliseconds */
const DEFAULT_TIMEOUT_MS = 10000;

export interface DaemonSearchRequest {
  query: string;
  limit?: number;
  scope?: MemoryScope;
}

export interface DaemonSearchResponse {
  results: SearchResult[];
  error?: string;
}

export interface DaemonThinkingSearchResponse {
  results: ThinkingSearchResult[];
  error?: string;
}

export interface DaemonRecentMemoriesResponse {
  memories: Memory[];
  error?: string;
}

export interface DaemonHealthResponse {
  status: 'ok';
  timestamp: string;
}

/**
 * Make an HTTP request to the daemon
 */
async function makeRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const config = getConfig();
  const port = config.mcp.port;
  const host = config.mcp.host;

  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: host,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: timeoutMs,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data) as T;
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error((parsed as { error?: string }).error ?? `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Check if the daemon is running
 */
export async function isDaemonRunning(): Promise<boolean> {
  try {
    await makeRequest<DaemonHealthResponse>('GET', '/health', undefined, 2000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Search episodic memories via the daemon
 */
export async function searchEpisodicMemories(
  query: string,
  options: { limit?: number; scope?: MemoryScope } = {}
): Promise<SearchResult[]> {
  const running = await isDaemonRunning();
  if (!running) {
    throw new Error('Daemon not running');
  }

  const response = await makeRequest<DaemonSearchResponse>('POST', '/search/episodic', {
    query,
    limit: options.limit,
    scope: options.scope,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.results;
}

/**
 * Search thinking memories via the daemon
 */
export async function searchThinkingMemories(
  query: string,
  options: { limit?: number; scope?: MemoryScope } = {}
): Promise<ThinkingSearchResult[]> {
  const running = await isDaemonRunning();
  if (!running) {
    throw new Error('Daemon not running');
  }

  const response = await makeRequest<DaemonThinkingSearchResponse>('POST', '/search/thinking', {
    query,
    limit: options.limit,
    scope: options.scope,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.results;
}

/**
 * Get recent memories via the daemon (for session-start)
 */
export async function getRecentMemories(limit?: number): Promise<Memory[]> {
  const running = await isDaemonRunning();
  if (!running) {
    throw new Error('Daemon not running');
  }

  const response = await makeRequest<DaemonRecentMemoriesResponse>('POST', '/memories/recent', {
    limit,
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.memories;
}

/**
 * Create a daemon client with fallback behavior
 *
 * If the daemon is not running, the fallback function will be called instead.
 * This allows hooks to gracefully degrade when the daemon is unavailable.
 */
export class DaemonClient {
  private daemonAvailable: boolean | null = null;

  /**
   * Check daemon availability (cached for the lifetime of the client)
   */
  async checkDaemon(): Promise<boolean> {
    if (this.daemonAvailable === null) {
      this.daemonAvailable = await isDaemonRunning();
      if (this.daemonAvailable) {
        logger.hooks.debug('Daemon is available, using HTTP client');
      } else {
        logger.hooks.debug('Daemon not available');
      }
    }
    return this.daemonAvailable;
  }

  /**
   * Search episodic memories, with optional fallback
   */
  async searchEpisodic(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {},
    fallback?: () => Promise<SearchResult[]>
  ): Promise<SearchResult[]> {
    const available = await this.checkDaemon();

    if (available) {
      try {
        return await searchEpisodicMemories(query, options);
      } catch (error) {
        logger.hooks.warn(`Daemon search failed: ${String(error)}`);
        if (fallback) {
          logger.hooks.debug('Using fallback for episodic search');
          return fallback();
        }
        throw error;
      }
    }

    if (fallback) {
      return fallback();
    }

    throw new Error('Daemon not available and no fallback provided');
  }

  /**
   * Search thinking memories, with optional fallback
   */
  async searchThinking(
    query: string,
    options: { limit?: number; scope?: MemoryScope } = {},
    fallback?: () => Promise<ThinkingSearchResult[]>
  ): Promise<ThinkingSearchResult[]> {
    const available = await this.checkDaemon();

    if (available) {
      try {
        return await searchThinkingMemories(query, options);
      } catch (error) {
        logger.hooks.warn(`Daemon thinking search failed: ${String(error)}`);
        if (fallback) {
          logger.hooks.debug('Using fallback for thinking search');
          return fallback();
        }
        throw error;
      }
    }

    if (fallback) {
      return fallback();
    }

    throw new Error('Daemon not available and no fallback provided');
  }

  /**
   * Get recent memories, with optional fallback
   */
  async getRecent(
    limit?: number,
    fallback?: () => Promise<Memory[]>
  ): Promise<Memory[]> {
    const available = await this.checkDaemon();

    if (available) {
      try {
        return await getRecentMemories(limit);
      } catch (error) {
        logger.hooks.warn(`Daemon recent memories failed: ${String(error)}`);
        if (fallback) {
          logger.hooks.debug('Using fallback for recent memories');
          return fallback();
        }
        throw error;
      }
    }

    if (fallback) {
      return fallback();
    }

    throw new Error('Daemon not available and no fallback provided');
  }
}
