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
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
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
});

export type CreateMemoryInput = z.infer<typeof createMemoryInputSchema>;

/**
 * Input for updating an existing memory
 */
export const updateMemoryInputSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(200).optional(),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(20).optional(),
  applies_to: memoryScopeSchema.optional(),
  content: z.string().min(10).optional(),
});

export type UpdateMemoryInput = z.infer<typeof updateMemoryInputSchema>;

/**
 * Memory index structure - maps keywords to memory IDs
 */
export interface MemoryIndex {
  version: number;
  built_at: string;
  keywords: Record<string, string[]>; // keyword -> memory IDs
  memories: Record<string, MemoryIndexEntry>; // memory ID -> metadata
}

/**
 * Index entry for a single memory
 */
export interface MemoryIndexEntry {
  id: string;
  subject: string;
  keywords: string[];
  applies_to: MemoryScope;
  updated_at: string;
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  memory: Memory;
  score: number;
  matchedKeywords: string[];
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
  hooks: z.object({
    timeWindow: z.number().positive().default(30),
    maxContextMemories: z.number().positive().default(10),
  }).default({}),
  mcp: z.object({
    port: z.number().positive().default(3000),
    host: z.string().default('localhost'),
  }).default({}),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Transcript message structure
 */
export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
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
