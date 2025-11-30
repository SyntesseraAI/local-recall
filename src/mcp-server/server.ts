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
import { loadConfig } from '../utils/config.js';
import { createTools, handleToolCall } from './tools.js';
import { logger } from '../utils/logger.js';
import { runTranscriptProcessing } from '../core/memory-extractor.js';

/** Processing interval in milliseconds (5 minutes) */
const PROCESSING_INTERVAL_MS = 5 * 60 * 1000;

/** Flag to prevent concurrent processing runs */
let isProcessing = false;

/**
 * Run transcript processing in the background
 */
async function runDaemonProcessing(): Promise<void> {
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
 * Start the daemon loop for periodic transcript processing
 */
function startDaemonLoop(): void {
  logger.mcp.info(`Starting daemon loop (interval: ${PROCESSING_INTERVAL_MS / 1000}s)`);

  // Run initial processing after a short delay (give server time to fully start)
  setTimeout(() => {
    runDaemonProcessing().catch((error) => {
      logger.mcp.error(`Initial processing failed: ${String(error)}`);
    });
  }, 5000);

  // Schedule periodic processing
  setInterval(() => {
    runDaemonProcessing().catch((error) => {
      logger.mcp.error(`Scheduled processing failed: ${String(error)}`);
    });
  }, PROCESSING_INTERVAL_MS);
}

async function main(): Promise<void> {
  logger.mcp.info('MCP server starting');

  // Load configuration
  await loadConfig();
  logger.mcp.debug('Configuration loaded');

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
