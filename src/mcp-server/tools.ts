/**
 * MCP Tool definitions and handlers for Local Recall
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MemoryManager } from '../core/memory.js';
import { SearchEngine } from '../core/search.js';
import { ThinkingMemoryManager } from '../core/thinking-memory.js';
import { ThinkingSearchEngine } from '../core/thinking-search.js';
import type { MemoryScope } from '../core/types.js';
// Note: Vector store syncing is handled by the MCP server daemon, not exposed as a tool

/**
 * Singleton instances for tool handlers.
 * Created once at module load to ensure cache consistency across tool calls
 * and avoid performance overhead of repeated instantiation.
 */
const memoryManager = new MemoryManager();
const searchEngine = new SearchEngine(memoryManager);
const thinkingMemoryManager = new ThinkingMemoryManager();
const thinkingSearchEngine = new ThinkingSearchEngine(thinkingMemoryManager);

/**
 * Create tool definitions for MCP
 */
export function createTools(): Tool[] {
  return [
    // Episodic memory tools
    {
      name: 'episodic_create',
      description:
        'Create a new episodic memory to persist important information across sessions. Use when learning architectural decisions, bug fixes with root causes, user preferences, configuration rationale, or any knowledge that should be remembered. Memories are stored as JSONL files and searchable via semantic similarity.',
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
      name: 'episodic_get',
      description:
        'Retrieve a specific episodic memory by its UUID. Use when you have a memory ID from search results and need the full content, or when following up on a specific memory reference.',
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
      name: 'episodic_search',
      description:
        'Search episodic memories for past decisions, architectural choices, bug fixes, user preferences, and project conventions. Use BEFORE making significant decisions to check for relevant historical context. Returns memories ranked by semantic similarity to your natural language query. Always search before proposing architectural changes, library selections, or implementation approaches.',
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
          max_tokens: {
            type: 'number',
            description: 'Maximum tokens to return (default: 2000)',
          },
        },
        required: ['query'],
      },
    },
    // Thinking memory tools
    {
      name: 'thinking_get',
      description:
        'Retrieve a specific thinking memory by its UUID. Thinking memories contain reasoning patterns - how problems were analyzed and what conclusions were reached. Use when you have a thinking memory ID and need the full thought process.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Thinking memory UUID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'thinking_search',
      description:
        'Search thinking memories for reasoning patterns, debugging approaches, and analysis techniques from past sessions. Use when facing complex problems to see how similar issues were analyzed before. Thinking memories capture the thought process paired with outcomes, showing "how I reasoned -> what I concluded". Especially useful for debugging, architectural analysis, and complex decision-making.',
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
          max_tokens: {
            type: 'number',
            description: 'Maximum tokens to return (default: 2000)',
          },
        },
        required: ['query'],
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
    // Episodic memory tools
    case 'episodic_create': {
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
        message: 'Episodic memory created successfully',
      };
    }

    case 'episodic_get': {
      const memory = await memoryManager.getMemory(args['id'] as string);
      if (!memory) {
        throw new Error(`Episodic memory with ID ${args['id']} not found`);
      }
      return memory;
    }

    case 'episodic_search': {
      const maxTokens = (args['max_tokens'] as number) ?? 2000;
      const results = await searchEngine.search(
        args['query'] as string,
        {
          scope: args['scope'] as MemoryScope | undefined,
          limit: args['limit'] as number | undefined,
        }
      );

      // Apply token limit
      const CHARS_PER_TOKEN = 4;
      let totalTokens = 0;
      const limitedResults = [];

      for (const r of results) {
        const memoryTokens = Math.ceil(r.memory.content.length / CHARS_PER_TOKEN);
        if (totalTokens + memoryTokens > maxTokens && limitedResults.length > 0) {
          break;
        }
        limitedResults.push(r);
        totalTokens += memoryTokens;
      }

      return {
        results: limitedResults.map((r) => ({
          id: r.memory.id,
          subject: r.memory.subject,
          similarity: r.score,
          keywords: r.memory.keywords,
          applies_to: r.memory.applies_to,
          occurred_at: r.memory.occurred_at,
          content: r.memory.content,
        })),
        total: limitedResults.length,
        tokens_used: totalTokens,
      };
    }

    // Thinking memory tools
    case 'thinking_get': {
      const memory = await thinkingMemoryManager.getMemory(args['id'] as string);
      if (!memory) {
        throw new Error(`Thinking memory with ID ${args['id']} not found`);
      }
      return memory;
    }

    case 'thinking_search': {
      const maxTokens = (args['max_tokens'] as number) ?? 2000;
      const results = await thinkingSearchEngine.search(
        args['query'] as string,
        {
          scope: args['scope'] as MemoryScope | undefined,
          limit: args['limit'] as number | undefined,
        }
      );

      // Apply token limit
      const CHARS_PER_TOKEN = 4;
      let totalTokens = 0;
      const limitedResults = [];

      for (const r of results) {
        const memoryTokens = Math.ceil(r.memory.content.length / CHARS_PER_TOKEN);
        if (totalTokens + memoryTokens > maxTokens && limitedResults.length > 0) {
          break;
        }
        limitedResults.push(r);
        totalTokens += memoryTokens;
      }

      return {
        results: limitedResults.map((r) => ({
          id: r.memory.id,
          subject: r.memory.subject,
          similarity: r.score,
          applies_to: r.memory.applies_to,
          occurred_at: r.memory.occurred_at,
          content: r.memory.content,
        })),
        total: limitedResults.length,
        tokens_used: totalTokens,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
