import { z } from 'zod';

/**
 * Memory scope types
 */
export type MemoryScope = 'global' | `file:${string}` | `area:${string}`;

/**
 * Schema for memory scope validation
 */
export const memoryScopeSchema = z.string().refine(
  (val): val is MemoryScope => {
    return val === 'global' || val.startsWith('file:') || val.startsWith('area:');
  },
  { message: "Scope must be 'global', 'file:<path>', or 'area:<name>'" }
);

/**
 * Memory frontmatter schema
 */
export const memoryFrontmatterSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(200),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(20),
  applies_to: memoryScopeSchema,
  occurred_at: z.string().datetime(),
  content_hash: z.string(),
});

export type MemoryFrontmatter = z.infer<typeof memoryFrontmatterSchema>;

/**
 * Complete memory structure
 */
export interface Memory extends MemoryFrontmatter {
  content: string;
}

/**
 * Input for creating a new memory
 */
export const createMemoryInputSchema = z.object({
  subject: z.string().min(1).max(200),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(20),
  applies_to: memoryScopeSchema,
  content: z.string().min(10),
  occurred_at: z.string().datetime().optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemoryInputSchema>;

/**
 * Thinking memory frontmatter schema (no keywords)
 */
export const thinkingMemoryFrontmatterSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(200),
  applies_to: memoryScopeSchema,
  occurred_at: z.string().datetime(),
  content_hash: z.string(),
});

export type ThinkingMemoryFrontmatter = z.infer<typeof thinkingMemoryFrontmatterSchema>;

/**
 * Complete thinking memory structure (no keywords)
 */
export interface ThinkingMemory extends ThinkingMemoryFrontmatter {
  content: string;
}

/**
 * Input for creating a new thinking memory
 */
export const createThinkingMemoryInputSchema = z.object({
  subject: z.string().min(1).max(200),
  applies_to: memoryScopeSchema,
  content: z.string().min(10),
  occurred_at: z.string().datetime().optional(),
});

export type CreateThinkingMemoryInput = z.infer<typeof createThinkingMemoryInputSchema>;

/**
 * Search result with relevance score
 */
export interface SearchResult {
  memory: Memory;
  score: number;
  matchedKeywords: string[];
}

/**
 * Thinking memory search result (no keywords)
 */
export interface ThinkingSearchResult {
  memory: ThinkingMemory;
  score: number;
}

/**
 * Search options
 */
export interface SearchOptions {
  limit?: number;
  scope?: MemoryScope;
  threshold?: number;
}

/**
 * Configuration schema
 */
export const configSchema = z.object({
  memoryDir: z.string().default('./local-recall'),
  maxMemories: z.number().positive().default(1000),
  indexRefreshInterval: z.number().nonnegative().default(300),
  fuzzyThreshold: z.number().min(0).max(1).default(0.6),
  episodicEnabled: z.boolean().default(true),
  episodicMaxTokens: z.number().positive().default(1000),
  episodicMinSimilarity: z.number().min(0).max(1).default(0.5),
  thinkingEnabled: z.boolean().default(true),
  thinkingMaxTokens: z.number().positive().default(1000),
  thinkingMinSimilarity: z.number().min(0).max(1).default(0.5),
  hooks: z.object({
    maxContextMemories: z.number().positive().default(10),
  }).default({}),
  mcp: z.object({
    port: z.number().positive().default(7847),
    host: z.string().default('localhost'),
  }).default({}),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Content block types in transcript messages
 */
export interface ThinkingContentBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

export interface TextContentBlock {
  type: 'text';
  text: string;
}

export interface ToolUseContentBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultContentBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export type ContentBlock =
  | ThinkingContentBlock
  | TextContentBlock
  | ToolUseContentBlock
  | ToolResultContentBlock;

/**
 * Raw transcript message structure (as received from Claude Code)
 * The message field contains the actual API response with content blocks
 */
export interface RawTranscriptMessage {
  type: 'user' | 'assistant';
  timestamp: string;
  uuid?: string;
  message?: {
    content: ContentBlock[] | string;
    role?: string;
    model?: string;
    id?: string;
  };
  // For user messages, content may be at the root level
  content?: ContentBlock[] | string;
}

/**
 * Parsed transcript message with extracted content
 */
export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  timestamp: string;
}

/**
 * Transcript input for stop hook
 */
export interface TranscriptInput {
  transcript: TranscriptMessage[];
  session_id: string;
  working_directory: string;
}
