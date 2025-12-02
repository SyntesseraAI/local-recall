/**
 * MCP Tool definitions and handlers for Local Recall
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MemoryManager } from '../core/memory.js';
import { SearchEngine } from '../core/search.js';
import { getVectorStore } from '../core/vector-store.js';
import type { MemoryScope } from '../core/types.js';

/**
 * Singleton instances for tool handlers.
 * Created once at module load to ensure cache consistency across tool calls
 * and avoid performance overhead of repeated instantiation.
 */
const memoryManager = new MemoryManager();
const searchEngine = new SearchEngine(memoryManager);

/**
 * Create tool definitions for MCP
 */
export function createTools(): Tool[] {
  return [
    {
      name: 'memory_create',
      description: 'Create a new memory with subject, keywords, scope, and content',
      inputSchema: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Brief description of the memory (1-200 chars)',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Searchable keywords (1-20 keywords)',
          },
          applies_to: {
            type: 'string',
            description: "Scope: 'global', 'file:<path>', or 'area:<name>'",
          },
          content: {
            type: 'string',
            description: 'The memory content in markdown',
          },
        },
        required: ['subject', 'keywords', 'applies_to', 'content'],
      },
    },
    {
      name: 'memory_get',
      description: 'Retrieve a specific memory by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Memory UUID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'memory_search',
      description: 'Search memories using semantic vector similarity',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (natural language)',
          },
          scope: {
            type: 'string',
            description: 'Optional scope filter',
          },
          limit: {
            type: 'number',
            description: 'Maximum results (default: 10)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'memory_list',
      description: 'List all memories with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            description: 'Filter by scope',
          },
          limit: {
            type: 'number',
            description: 'Maximum results',
          },
          offset: {
            type: 'number',
            description: 'Pagination offset',
          },
        },
      },
    },
    {
      name: 'index_rebuild',
      description: 'Resync the vector store with memory files',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

/**
 * Handle a tool call
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    const result = await executeToolCall(name, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: {
                code: 'TOOL_ERROR',
                message: String(error),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }
}

/**
 * Execute a specific tool using module-level singleton instances
 */
async function executeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'memory_create': {
      // Use current time as occurred_at for MCP-created memories
      const occurredAt = new Date().toISOString();
      const memory = await memoryManager.createMemory({
        subject: args['subject'] as string,
        keywords: args['keywords'] as string[],
        applies_to: args['applies_to'] as MemoryScope,
        content: args['content'] as string,
        occurred_at: occurredAt,
      });
      return {
        success: true,
        id: memory.id,
        message: 'Memory created successfully',
      };
    }

    case 'memory_get': {
      const memory = await memoryManager.getMemory(args['id'] as string);
      if (!memory) {
        throw new Error(`Memory with ID ${args['id']} not found`);
      }
      return memory;
    }

    case 'memory_search': {
      const results = await searchEngine.search(
        args['query'] as string,
        {
          scope: args['scope'] as MemoryScope | undefined,
          limit: args['limit'] as number | undefined,
        }
      );
      return {
        results: results.map((r) => ({
          id: r.memory.id,
          subject: r.memory.subject,
          similarity: r.score,
          keywords: r.memory.keywords,
          applies_to: r.memory.applies_to,
        })),
        total: results.length,
      };
    }

    case 'memory_list': {
      const memories = await memoryManager.listMemories({
        scope: args['scope'] as MemoryScope | undefined,
        limit: args['limit'] as number | undefined,
        offset: args['offset'] as number | undefined,
      });
      return {
        memories: memories.map((m) => ({
          id: m.id,
          subject: m.subject,
          keywords: m.keywords,
          applies_to: m.applies_to,
          occurred_at: m.occurred_at,
        })),
        total: memories.length,
      };
    }

    case 'index_rebuild': {
      // Sync vector store with memory files
      const memories = await memoryManager.listMemories();
      const vectorStore = getVectorStore();
      await vectorStore.initialize();
      const syncResult = await vectorStore.sync(memories);
      return {
        success: true,
        memories_synced: memories.length,
        vector_added: syncResult.added,
        vector_removed: syncResult.removed,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
