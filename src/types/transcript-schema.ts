/**
 * Claude Code Transcript JSONL Schema
 *
 * This file defines TypeScript types for parsing Claude Code transcript files.
 * Transcripts are stored as JSONL (one JSON object per line).
 */

// =============================================================================
// Base Types
// =============================================================================

/**
 * All transcript entries share these base fields
 */
export interface BaseTranscriptEntry {
  parentUuid: string | null;
  isSidechain: boolean;
  userType: "external";
  cwd: string;
  sessionId: string;
  version: string;
  gitBranch: string;
  uuid: string;
  timestamp: string;
  slug?: string; // Appears after first exchange in a session
}

// =============================================================================
// Content Block Types
// =============================================================================

/**
 * Text content block
 */
export interface TextContent {
  type: "text";
  text: string;
}

/**
 * Thinking content block (assistant's internal reasoning)
 */
export interface ThinkingContent {
  type: "thinking";
  thinking: string;
  signature: string; // Cryptographic signature
}

/**
 * Tool use content block (assistant requesting tool execution)
 */
export interface ToolUseContent {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/**
 * Tool result content block (result of tool execution)
 */
export interface ToolResultContent {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * All possible content block types for assistant messages
 */
export type AssistantContentBlock =
  | TextContent
  | ThinkingContent
  | ToolUseContent;

/**
 * All possible content block types for user messages
 */
export type UserContentBlock = TextContent | ToolResultContent;

// =============================================================================
// Tool Input Types
// =============================================================================

export interface ReadToolInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

export interface EditToolInput {
  file_path: string;
  old_string: string;
  new_string: string;
}

export interface WriteToolInput {
  file_path: string;
  content: string;
}

export interface BashToolInput {
  command: string;
  description?: string;
}

export interface GrepToolInput {
  pattern: string;
  path?: string;
  glob?: string;
}

export interface GlobToolInput {
  pattern: string;
  path?: string;
}

export interface TaskToolInput {
  prompt: string;
  description?: string;
}

export interface TodoWriteInput {
  todos: Todo[];
}

export interface Todo {
  content: string;
  status: "pending" | "in_progress" | "completed";
  activeForm: string;
}

// =============================================================================
// Tool Result Types
// =============================================================================

export interface FileReadResult {
  type: "text";
  file: {
    filePath: string;
    content: string;
    numLines: number;
    startLine: number;
    totalLines: number;
  };
}

export interface PatchHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[]; // Lines prefixed with " " (context), "+" (added), or "-" (removed)
}

export interface FileEditResult {
  filePath: string;
  oldString: string;
  newString: string;
  originalFile: string;
  structuredPatch: PatchHunk[];
  userModified: boolean;
  replaceAll: boolean;
}

export interface BashResult {
  stdout: string;
  stderr: string;
  interrupted: boolean;
  isImage: boolean;
}

export interface TodoResult {
  oldTodos: Todo[];
  newTodos: Todo[];
}

/**
 * All possible tool result data types
 */
export type ToolUseResultData =
  | FileReadResult
  | FileEditResult
  | BashResult
  | TodoResult
  | string; // Error message or simple string result

// =============================================================================
// API Message Types
// =============================================================================

export interface APIMessageUsage {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  cache_creation: {
    ephemeral_5m_input_tokens: number;
    ephemeral_1h_input_tokens: number;
  };
  output_tokens: number;
  service_tier: string;
}

export interface AssistantAPIMessage {
  model: string;
  id: string;
  type: "message";
  role: "assistant";
  content: AssistantContentBlock[];
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: APIMessageUsage;
}

export interface UserAPIMessage {
  role: "user";
  content: string | UserContentBlock[];
}

// =============================================================================
// Transcript Entry Types
// =============================================================================

/**
 * User message entry
 */
export interface UserMessageEntry extends BaseTranscriptEntry {
  type: "user";
  message: UserAPIMessage;
  thinkingMetadata?: {
    level: string;
    disabled: boolean;
    triggers: unknown[];
  };
  todos?: Todo[];
  toolUseResult?: ToolUseResultData;
}

/**
 * Assistant message entry
 */
export interface AssistantMessageEntry extends BaseTranscriptEntry {
  type: "assistant";
  message: AssistantAPIMessage;
  requestId: string;
}

/**
 * System message entry (e.g., hook summaries)
 */
export interface SystemMessageEntry extends BaseTranscriptEntry {
  type: "system";
  subtype: "stop_hook_summary" | string;
  hookCount: number;
  hookInfos: Array<{ command: string }>;
  hookErrors: unknown[];
  preventedContinuation: boolean;
  stopReason: string;
  hasOutput: boolean;
  level: "suggestion" | string;
  toolUseID: string;
}

/**
 * File backup information
 */
export interface FileBackup {
  backupFileName: string;
  version: number;
  backupTime: string;
}

/**
 * File history snapshot entry
 */
export interface FileHistorySnapshotEntry {
  type: "file-history-snapshot";
  messageId: string;
  isSnapshotUpdate: boolean;
  snapshot: {
    messageId: string;
    timestamp: string;
    trackedFileBackups: Record<string, FileBackup>;
  };
}

/**
 * Queue operation entry
 */
export interface QueueOperationEntry {
  type: "queue-operation";
  operation: "enqueue" | "dequeue" | "remove" | "popAll";
  timestamp: string;
  content: string;
  sessionId: string;
}

/**
 * Union type of all possible transcript entries
 */
export type TranscriptEntry =
  | UserMessageEntry
  | AssistantMessageEntry
  | SystemMessageEntry
  | FileHistorySnapshotEntry
  | QueueOperationEntry;

// =============================================================================
// Type Guards
// =============================================================================

export function isUserMessageEntry(
  entry: TranscriptEntry
): entry is UserMessageEntry {
  return entry.type === "user";
}

export function isAssistantMessageEntry(
  entry: TranscriptEntry
): entry is AssistantMessageEntry {
  return entry.type === "assistant";
}

export function isSystemMessageEntry(
  entry: TranscriptEntry
): entry is SystemMessageEntry {
  return entry.type === "system";
}

export function isFileHistorySnapshotEntry(
  entry: TranscriptEntry
): entry is FileHistorySnapshotEntry {
  return entry.type === "file-history-snapshot";
}

export function isQueueOperationEntry(
  entry: TranscriptEntry
): entry is QueueOperationEntry {
  return entry.type === "queue-operation";
}

export function isTextContent(
  content: AssistantContentBlock | UserContentBlock
): content is TextContent {
  return content.type === "text";
}

export function isThinkingContent(
  content: AssistantContentBlock
): content is ThinkingContent {
  return content.type === "thinking";
}

export function isToolUseContent(
  content: AssistantContentBlock
): content is ToolUseContent {
  return content.type === "tool_use";
}

export function isToolResultContent(
  content: UserContentBlock
): content is ToolResultContent {
  return content.type === "tool_result";
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Parse a single line from a transcript JSONL file
 */
export function parseTranscriptLine(line: string): TranscriptEntry | null {
  if (!line.trim()) return null;

  try {
    return JSON.parse(line) as TranscriptEntry;
  } catch {
    return null;
  }
}

/**
 * Parse an entire transcript JSONL file content
 */
export function parseTranscriptEntries(content: string): TranscriptEntry[] {
  return content
    .split("\n")
    .map(parseTranscriptLine)
    .filter((entry): entry is TranscriptEntry => entry !== null);
}

/**
 * Extract text content from a user or assistant message entry
 */
export function extractTextContent(
  entry: UserMessageEntry | AssistantMessageEntry
): string {
  const { message } = entry;

  if (typeof message.content === "string") {
    return message.content;
  }

  return message.content
    .filter((c): c is TextContent => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

/**
 * Extract thinking content from an assistant message entry
 */
export function extractThinkingContent(entry: AssistantMessageEntry): string {
  return entry.message.content
    .filter((c): c is ThinkingContent => c.type === "thinking")
    .map((c) => c.thinking)
    .join("\n");
}

/**
 * Get only user and assistant message entries from transcript
 */
export function getMessageEntries(
  entries: TranscriptEntry[]
): (UserMessageEntry | AssistantMessageEntry)[] {
  return entries.filter(
    (entry): entry is UserMessageEntry | AssistantMessageEntry =>
      entry.type === "user" || entry.type === "assistant"
  );
}
