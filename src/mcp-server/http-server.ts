/**
 * HTTP Server for Local Recall Daemon
 *
 * Exposes search endpoints for hooks to use, avoiding the need for hooks
 * to load sqlite-vec directly. This prevents "mutex lock failed" errors
 * that occur when multiple processes load the native extension.
 *
 * Endpoints:
 * - POST /search/episodic - Search episodic memories
 * - POST /search/thinking - Search thinking memories
 * - GET /health - Health check
 */

import http from 'node:http';
import { SearchEngine } from '../core/search.js';
import { ThinkingSearchEngine } from '../core/thinking-search.js';
import { MemoryManager } from '../core/memory.js';
import { getConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { SearchResult, ThinkingSearchResult, MemoryScope } from '../core/types.js';

export interface SearchRequest {
  query: string;
  limit?: number;
  scope?: MemoryScope;
}

export interface SearchResponse {
  results: SearchResult[] | ThinkingSearchResult[];
  error?: string;
}

export interface RecentMemoriesRequest {
  limit?: number;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

let server: http.Server | null = null;
let searchEngine: SearchEngine | null = null;
let thinkingSearchEngine: ThinkingSearchEngine | null = null;

/**
 * Parse JSON body from request
 */
async function parseBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) as T);
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Handle search requests
 */
async function handleEpisodicSearch(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    const body = await parseBody<SearchRequest>(req);

    if (!body.query || typeof body.query !== 'string') {
      sendJson(res, 400, { error: 'Missing or invalid query parameter' });
      return;
    }

    if (!searchEngine) {
      const config = getConfig();
      const memoryManager = new MemoryManager(config.memoryDir);
      searchEngine = new SearchEngine({ memoryManager, readonly: false });
    }

    const results = await searchEngine.search(body.query, {
      limit: body.limit ?? 50,
      scope: body.scope,
    });

    sendJson(res, 200, { results });
  } catch (error) {
    logger.mcp.error(`Episodic search error: ${String(error)}`);
    sendJson(res, 500, { error: String(error) });
  }
}

/**
 * Handle thinking search requests
 */
async function handleThinkingSearch(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    const body = await parseBody<SearchRequest>(req);

    if (!body.query || typeof body.query !== 'string') {
      sendJson(res, 400, { error: 'Missing or invalid query parameter' });
      return;
    }

    if (!thinkingSearchEngine) {
      thinkingSearchEngine = new ThinkingSearchEngine({ readonly: false });
    }

    const results = await thinkingSearchEngine.search(body.query, {
      limit: body.limit ?? 50,
      scope: body.scope,
    });

    sendJson(res, 200, { results });
  } catch (error) {
    logger.mcp.error(`Thinking search error: ${String(error)}`);
    sendJson(res, 500, { error: String(error) });
  }
}

/**
 * Handle recent memories requests (for session-start)
 */
async function handleRecentMemories(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  try {
    const body = await parseBody<RecentMemoriesRequest>(req);
    const config = getConfig();
    const memoryManager = new MemoryManager(config.memoryDir);

    const memories = await memoryManager.listMemories({
      limit: body.limit ?? config.hooks.maxContextMemories,
    });

    sendJson(res, 200, { memories });
  } catch (error) {
    logger.mcp.error(`Recent memories error: ${String(error)}`);
    sendJson(res, 500, { error: String(error) });
  }
}

/**
 * Handle health check
 */
function handleHealth(_req: http.IncomingMessage, res: http.ServerResponse): void {
  sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
}

/**
 * Request handler
 */
async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const { method, url } = req;
  logger.mcp.debug(`HTTP request: ${method} ${url}`);

  // CORS headers for local access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (method === 'GET' && url === '/health') {
      handleHealth(req, res);
    } else if (method === 'POST' && url === '/search/episodic') {
      await handleEpisodicSearch(req, res);
    } else if (method === 'POST' && url === '/search/thinking') {
      await handleThinkingSearch(req, res);
    } else if (method === 'POST' && url === '/memories/recent') {
      await handleRecentMemories(req, res);
    } else {
      sendJson(res, 404, { error: 'Not found' });
    }
  } catch (error) {
    logger.mcp.error(`HTTP handler error: ${String(error)}`);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}

/**
 * Start the HTTP server
 */
export function startHttpServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = getConfig();
    const port = config.mcp.port;
    const host = config.mcp.host;

    server = http.createServer((req, res) => {
      handleRequest(req, res).catch((error) => {
        logger.mcp.error(`Unhandled HTTP error: ${String(error)}`);
        if (!res.headersSent) {
          sendJson(res, 500, { error: 'Internal server error' });
        }
      });
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.mcp.warn(`Port ${port} already in use, HTTP server not started`);
        // Don't reject - the daemon can run without the HTTP server if another instance is running
        resolve();
      } else {
        reject(error);
      }
    });

    server.listen(port, host, () => {
      logger.mcp.info(`HTTP server listening on http://${host}:${port}`);
      resolve();
    });
  });
}

/**
 * Stop the HTTP server
 */
export function stopHttpServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        logger.mcp.info('HTTP server stopped');
        server = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get the HTTP server port (for testing)
 */
export function getHttpServerPort(): number {
  const config = getConfig();
  return config.mcp.port;
}
