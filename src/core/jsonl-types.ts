/**
 * JSONL Entry Types for Memory Storage
 *
 * Defines the schema for entries in the append-only JSONL log files.
 * Three entry types:
 * - add: Adds a new memory to the collection
 * - delete: Marks a memory as deleted
 * - embedding: Stores the vector embedding for a memory
 */

import { z } from 'zod';

/**
 * Scope schema for JSONL storage (simple string validation)
 * The MemoryScope type constraint is enforced at the application layer
 */
const scopeSchema = z.string().refine(
  (val) => val === 'global' || val.startsWith('file:') || val.startsWith('area:'),
  { message: "Scope must be 'global', 'file:<path>', or 'area:<name>'" }
);

/**
 * Episodic memory add entry schema
 */
export const episodicAddEntrySchema = z.object({
  action: z.literal('add'),
  id: z.string().uuid(),
  subject: z.string().min(1).max(200),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(20),
  applies_to: scopeSchema,
  occurred_at: z.string().datetime(),
  content_hash: z.string(),
  content: z.string().min(10),
  timestamp: z.string().datetime(),
});

export type EpisodicAddEntry = z.infer<typeof episodicAddEntrySchema>;

/**
 * Thinking memory add entry schema (no keywords field)
 */
export const thinkingAddEntrySchema = z.object({
  action: z.literal('add'),
  id: z.string().uuid(),
  subject: z.string().min(1).max(200),
  applies_to: scopeSchema,
  occurred_at: z.string().datetime(),
  content_hash: z.string(),
  content: z.string().min(10),
  timestamp: z.string().datetime(),
});

export type ThinkingAddEntry = z.infer<typeof thinkingAddEntrySchema>;

/**
 * Delete entry schema (shared by both memory types)
 */
export const deleteEntrySchema = z.object({
  action: z.literal('delete'),
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
});

export type DeleteEntry = z.infer<typeof deleteEntrySchema>;

/**
 * Embedding entry schema (shared by both memory types)
 * Stores the 768-dimension vector embedding for a memory
 */
export const embeddingEntrySchema = z.object({
  action: z.literal('embedding'),
  id: z.string().uuid(),
  embedding: z.array(z.number()),
  timestamp: z.string().datetime(),
});

export type EmbeddingEntry = z.infer<typeof embeddingEntrySchema>;

/**
 * Discriminated union for episodic memory JSONL entries
 */
export const episodicEntrySchema = z.discriminatedUnion('action', [
  episodicAddEntrySchema,
  deleteEntrySchema,
  embeddingEntrySchema,
]);

export type EpisodicEntry = z.infer<typeof episodicEntrySchema>;

/**
 * Discriminated union for thinking memory JSONL entries
 */
export const thinkingEntrySchema = z.discriminatedUnion('action', [
  thinkingAddEntrySchema,
  deleteEntrySchema,
  embeddingEntrySchema,
]);

export type ThinkingEntry = z.infer<typeof thinkingEntrySchema>;

/**
 * Compaction configuration
 */
export const compactionConfigSchema = z.object({
  /** Maximum file size in MB before triggering compaction */
  maxFileSizeMb: z.number().positive().default(50),
  /** Maximum ratio of delete entries before triggering compaction */
  maxDeleteRatio: z.number().min(0).max(1).default(0.3),
  /** Minimum number of entries before checking delete ratio */
  minEntriesForRatioCheck: z.number().positive().default(100),
});

export type CompactionConfig = z.infer<typeof compactionConfigSchema>;

/**
 * Compaction status returned by needsCompaction()
 */
export interface CompactionStatus {
  needsCompaction: boolean;
  reason?: 'file_size' | 'delete_ratio';
  fileSizeMb?: number;
  deleteRatio?: number;
  totalEntries?: number;
}
