#!/usr/bin/env node
/**
 * MCP Server for Local Recall
 *
 * Exposes memory tools via the Model Context Protocol.
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

  // Log startup (to stderr to not interfere with MCP protocol)
  logger.mcp.info('MCP server started and connected');
  console.error('Local Recall MCP server started');
}

main().catch((error) => {
  logger.mcp.error(`Fatal error: ${String(error)}`);
  console.error('Fatal error:', error);
  process.exit(1);
});
