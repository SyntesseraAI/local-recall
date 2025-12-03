#!/usr/bin/env node
/**
 * MCP Server for Local Recall
 *
 * Exposes memory tools via the Model Context Protocol.
 * Also runs a background daemon that processes transcripts every 5 minutes.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, getConfig } from '../utils/config.js';
import { createTools, handleToolCall } from './tools.js';
import { logger } from '../utils/logger.js';
import { runTranscriptProcessing } from '../core/memory-extractor.js';
import { runThinkingExtraction } from '../core/thinking-extractor.js';
import { getVectorStore } from '../core/vector-store.js';
import { getThinkingVectorStore } from '../core/thinking-vector-store.js';
import { MemoryManager } from '../core/memory.js';
import { ThinkingMemoryManager } from '../core/thinking-memory.js';

/** Transcript processing interval in milliseconds (5 minutes) */
const PROCESSING_INTERVAL_MS = 5 * 60 * 1000;

/** Vector store sync interval in milliseconds (10 minutes) */
const VECTOR_SYNC_INTERVAL_MS = 10 * 60 * 1000;

/** Flag to prevent concurrent episodic processing runs */
let isProcessing = false;

/** Flag to prevent concurrent thinking processing runs */
let isThinkingProcessing = false;

/** Flag to prevent concurrent episodic vector sync runs */
let isSyncing = false;

/** Flag to prevent concurrent thinking vector sync runs */
let isThinkingSyncing = false;

/**
 * Run transcript processing in the background
 */
async function runDaemonProcessing(): Promise<void> {
  const config = getConfig();
  if (!config.episodicEnabled) {
    logger.mcp.debug('Skipping episodic processing - disabled');
    return;
  }

  if (isProcessing) {
    logger.mcp.debug('Skipping processing run - already in progress');
    return;
  }

  isProcessing = true;
  logger.mcp.info('Starting scheduled transcript processing');

  try {
    const results = await runTranscriptProcessing();
    const memoriesCreated = results.reduce((sum, r) => sum + r.memoriesCreated.length, 0);
    logger.mcp.info(`Transcript processing complete: ${memoriesCreated} memories created`);
  } catch (error) {
    logger.mcp.error(`Transcript processing failed: ${String(error)}`);
  } finally {
    isProcessing = false;
  }
}

/**
 * Sync vector store with file-based memories
 */
async function runVectorSync(): Promise<void> {
  const config = getConfig();
  if (!config.episodicEnabled) {
    logger.mcp.debug('Skipping vector sync - episodic disabled');
    return;
  }

  if (isSyncing) {
    logger.mcp.debug('Skipping vector sync - already in progress');
    return;
  }

  isSyncing = true;
  logger.mcp.info('Starting vector store sync');

  try {
    const memoryManager = new MemoryManager();
    const memories = await memoryManager.listMemories();
    const vectorStore = getVectorStore();
    const result = await vectorStore.sync(memories);
    logger.mcp.info(`Vector sync complete: ${result.added} added, ${result.removed} removed`);
  } catch (error) {
    logger.mcp.error(`Vector sync failed: ${String(error)}`);
  } finally {
    isSyncing = false;
  }
}

/**
 * Run thinking memory extraction in the background
 */
async function runThinkingDaemonProcessing(): Promise<void> {
  const config = getConfig();
  if (!config.thinkingEnabled) {
    logger.mcp.debug('Skipping thinking processing - disabled');
    return;
  }

  if (isThinkingProcessing) {
    logger.mcp.debug('Skipping thinking processing run - already in progress');
    return;
  }

  isThinkingProcessing = true;
  logger.mcp.info('Starting scheduled thinking memory extraction');

  try {
    const results = await runThinkingExtraction();
    const memoriesCreated = results.reduce((sum, r) => sum + r.memoriesCreated.length, 0);
    logger.mcp.info(`Thinking extraction complete: ${memoriesCreated} thinking memories created`);
  } catch (error) {
    logger.mcp.error(`Thinking extraction failed: ${String(error)}`);
  } finally {
    isThinkingProcessing = false;
  }
}

/**
 * Sync thinking vector store with file-based thinking memories
 */
async function runThinkingVectorSync(): Promise<void> {
  const config = getConfig();
  if (!config.thinkingEnabled) {
    logger.mcp.debug('Skipping thinking vector sync - disabled');
    return;
  }

  if (isThinkingSyncing) {
    logger.mcp.debug('Skipping thinking vector sync - already in progress');
    return;
  }

  isThinkingSyncing = true;
  logger.mcp.info('Starting thinking vector store sync');

  try {
    const memoryManager = new ThinkingMemoryManager();
    const memories = await memoryManager.listMemories();
    const vectorStore = getThinkingVectorStore();
    const result = await vectorStore.sync(memories);
    logger.mcp.info(`Thinking vector sync complete: ${result.added} added, ${result.removed} removed`);
  } catch (error) {
    logger.mcp.error(`Thinking vector sync failed: ${String(error)}`);
  } finally {
    isThinkingSyncing = false;
  }
}

/**
 * Start the daemon loop for periodic transcript processing and vector sync
 */
function startDaemonLoop(): void {
  logger.mcp.info(`Starting daemon loop (transcript: ${PROCESSING_INTERVAL_MS / 1000}s, vector: ${VECTOR_SYNC_INTERVAL_MS / 1000}s)`);

  // Run initial vector syncs immediately on startup (after short delay for server init)
  setTimeout(() => {
    // Run both episodic and thinking vector syncs in parallel
    Promise.all([
      runVectorSync().catch((error) => {
        logger.mcp.error(`Initial vector sync failed: ${String(error)}`);
      }),
      runThinkingVectorSync().catch((error) => {
        logger.mcp.error(`Initial thinking vector sync failed: ${String(error)}`);
      }),
    ]);
  }, 2000);

  // Run initial transcript processing after a short delay
  setTimeout(() => {
    // Run both episodic and thinking extraction in parallel
    Promise.all([
      runDaemonProcessing().catch((error) => {
        logger.mcp.error(`Initial processing failed: ${String(error)}`);
      }),
      runThinkingDaemonProcessing().catch((error) => {
        logger.mcp.error(`Initial thinking processing failed: ${String(error)}`);
      }),
    ]);
  }, 5000);

  // Schedule periodic transcript processing (every 5 minutes)
  setInterval(() => {
    // Run both episodic and thinking extraction in parallel
    Promise.all([
      runDaemonProcessing().catch((error) => {
        logger.mcp.error(`Scheduled processing failed: ${String(error)}`);
      }),
      runThinkingDaemonProcessing().catch((error) => {
        logger.mcp.error(`Scheduled thinking processing failed: ${String(error)}`);
      }),
    ]);
  }, PROCESSING_INTERVAL_MS);

  // Schedule periodic vector sync (every 10 minutes)
  setInterval(() => {
    // Run both episodic and thinking vector syncs in parallel
    Promise.all([
      runVectorSync().catch((error) => {
        logger.mcp.error(`Scheduled vector sync failed: ${String(error)}`);
      }),
      runThinkingVectorSync().catch((error) => {
        logger.mcp.error(`Scheduled thinking vector sync failed: ${String(error)}`);
      }),
    ]);
  }, VECTOR_SYNC_INTERVAL_MS);
}

async function main(): Promise<void> {
  logger.mcp.info('MCP server starting');

  // Load configuration
  await loadConfig();
  logger.mcp.debug('Configuration loaded');

  // NOTE: Using Orama (pure JavaScript) for vector search - no native mutex issues

  // Create MCP server
  const server = new Server(
    {
      name: 'local-recall',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Get tool definitions
  const tools = createTools();
  logger.mcp.debug(`Registered ${tools.length} tools`);

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.mcp.debug('Handling ListTools request');
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.mcp.info(`Tool call: ${name}`);
    logger.mcp.debug(`Tool call ${name} with args: ${JSON.stringify(args)}`);
    const result = await handleToolCall(name, args ?? {});
    logger.mcp.debug(`Tool call ${name} completed`);
    return result;
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Start the daemon loop for transcript processing
  startDaemonLoop();

  // Log startup (to stderr to not interfere with MCP protocol)
  logger.mcp.info('MCP server started and connected');
  console.error('Local Recall MCP server started');
}

main().catch((error) => {
  logger.mcp.error(`Fatal error: ${String(error)}`);
  console.error('Fatal error:', error);
  process.exit(1);
});
