/**
 * Transcript Condenser
 *
 * Parses raw JSONL transcripts and extracts only the minimum content needed
 * for memory extraction. This significantly reduces token usage when calling
 * the Claude CLI for memory extraction.
 */

import {
  type UserMessageEntry,
  type AssistantMessageEntry,
  type UserContentBlock,
  type ToolUseContent,
  type TextContent,
  type ToolResultContent,
  type FileReadResult,
  type FileEditResult,
  type BashResult,
  parseTranscriptLine,
  isUserMessageEntry,
  isAssistantMessageEntry,
  isTextContent,
  isToolUseContent,
  isToolResultContent,
} from "../types/transcript-schema.js";

// =============================================================================
// Condensed Event Types
// =============================================================================

/**
 * A condensed representation of a transcript event for memory extraction
 */
export type CondensedEvent =
  | CondensedUserMessage
  | CondensedAssistantMessage
  | CondensedToolUse
  | CondensedToolResult;

export interface CondensedUserMessage {
  type: "user_message";
  timestamp: string;
  text: string;
}

export interface CondensedAssistantMessage {
  type: "assistant_message";
  timestamp: string;
  text: string;
}

export interface CondensedToolUse {
  type: "tool_use";
  timestamp: string;
  toolId: string;
  toolName: string;
  summary: string;
}

export interface CondensedToolResult {
  type: "tool_result";
  timestamp: string;
  toolId: string;
  success: boolean;
  summary: string;
}

// =============================================================================
// Tool Summarizers
// =============================================================================

const MAX_TEXT_LENGTH = 500;
const MAX_SUMMARY_LENGTH = 200;

/**
 * Truncate text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Summarize a Read tool use
 */
function summarizeReadTool(input: Record<string, unknown>): string {
  const file_path = input.file_path as string | undefined;
  const offset = input.offset as number | undefined;
  const limit = input.limit as number | undefined;
  if (offset !== undefined || limit !== undefined) {
    return `Read ${file_path} (lines ${offset ?? 0}-${(offset ?? 0) + (limit ?? 2000)})`;
  }
  return `Read ${file_path}`;
}

/**
 * Summarize an Edit tool use
 */
function summarizeEditTool(input: Record<string, unknown>): string {
  const file_path = input.file_path as string | undefined;
  const old_string = (input.old_string as string | undefined) ?? "";
  const new_string = (input.new_string as string | undefined) ?? "";
  const oldPreview = truncate(old_string.split("\n")[0] ?? "", 50);
  const newPreview = truncate(new_string.split("\n")[0] ?? "", 50);
  return `Edit ${file_path}: "${oldPreview}" → "${newPreview}"`;
}

/**
 * Summarize a Write tool use
 */
function summarizeWriteTool(input: Record<string, unknown>): string {
  const file_path = input.file_path as string | undefined;
  const content = (input.content as string | undefined) ?? "";
  const lines = content.split("\n").length;
  return `Write ${file_path} (${lines} lines)`;
}

/**
 * Summarize a Bash tool use
 */
function summarizeBashTool(input: Record<string, unknown>): string {
  const command = (input.command as string | undefined) ?? "";
  const description = input.description as string | undefined;
  if (description) {
    return `Bash: ${description} (${truncate(command, 50)})`;
  }
  return `Bash: ${truncate(command, 100)}`;
}

/**
 * Summarize a Grep tool use
 */
function summarizeGrepTool(input: Record<string, unknown>): string {
  const pattern = input.pattern as string | undefined;
  const path = input.path as string | undefined;
  const glob = input.glob as string | undefined;
  let summary = `Grep: "${pattern}"`;
  if (path) summary += ` in ${path}`;
  if (glob) summary += ` (${glob})`;
  return summary;
}

/**
 * Summarize a Glob tool use
 */
function summarizeGlobTool(input: Record<string, unknown>): string {
  const pattern = input.pattern as string | undefined;
  const path = input.path as string | undefined;
  return path ? `Glob: ${pattern} in ${path}` : `Glob: ${pattern}`;
}

/**
 * Summarize a Task tool use
 */
function summarizeTaskTool(input: Record<string, unknown>): string {
  const description = input.description as string | undefined;
  const prompt = (input.prompt as string | undefined) ?? "";
  if (description) {
    return `Task: ${description}`;
  }
  return `Task: ${truncate(prompt, 100)}`;
}

/**
 * Summarize any tool use based on its name and input
 */
function summarizeToolUse(
  name: string,
  input: Record<string, unknown>
): string {
  switch (name) {
    case "Read":
      return summarizeReadTool(input);
    case "Edit":
      return summarizeEditTool(input);
    case "Write":
      return summarizeWriteTool(input);
    case "Bash":
      return summarizeBashTool(input);
    case "Grep":
      return summarizeGrepTool(input);
    case "Glob":
      return summarizeGlobTool(input);
    case "Task":
      return summarizeTaskTool(input);
    case "TodoWrite":
      return "TodoWrite: Updated task list";
    default:
      // For unknown tools, try to extract a description or use the tool name
      if (typeof input.description === "string") {
        return `${name}: ${truncate(input.description, 100)}`;
      }
      return `${name}: (tool invoked)`;
  }
}

// =============================================================================
// Tool Result Summarizers
// =============================================================================

/**
 * Check if a tool result indicates an error
 */
function isErrorResult(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return (
    lowerContent.startsWith("error:") ||
    lowerContent.includes("failed") ||
    lowerContent.includes("permission denied") ||
    lowerContent.includes("no such file") ||
    lowerContent.includes("command not found")
  );
}

/**
 * Summarize a file read result
 */
function summarizeFileReadResult(result: FileReadResult): string {
  const { file } = result;
  return `Read ${file.numLines} lines from ${file.filePath}`;
}

/**
 * Summarize a file edit result
 */
function summarizeFileEditResult(result: FileEditResult): string {
  const { filePath, structuredPatch } = result;
  const totalChanges = structuredPatch.reduce((sum, hunk) => {
    const added = hunk.lines.filter((l) => l.startsWith("+")).length;
    const removed = hunk.lines.filter((l) => l.startsWith("-")).length;
    return sum + added + removed;
  }, 0);
  return `Edited ${filePath} (${totalChanges} line changes)`;
}

/**
 * Summarize a bash result
 */
function summarizeBashResult(result: BashResult): string {
  const { stdout, stderr, interrupted } = result;
  if (interrupted) return "Command interrupted";
  if (stderr && !stdout) return `Error: ${truncate(stderr, 100)}`;
  if (stdout) {
    const lines = stdout.split("\n").filter((l) => l.trim()).length;
    return `Output: ${lines} lines`;
  }
  return "Completed (no output)";
}

/**
 * Summarize a tool result
 */
function summarizeToolResult(
  toolUseResult: unknown,
  resultContent: string
): { success: boolean; summary: string } {
  // Check for structured results
  if (toolUseResult && typeof toolUseResult === "object") {
    const result = toolUseResult as Record<string, unknown>;

    // FileReadResult
    if (result.type === "text" && result.file) {
      return {
        success: true,
        summary: summarizeFileReadResult(result as unknown as FileReadResult),
      };
    }

    // FileEditResult
    if (result.filePath && result.structuredPatch) {
      return {
        success: true,
        summary: summarizeFileEditResult(result as unknown as FileEditResult),
      };
    }

    // BashResult
    if ("stdout" in result || "stderr" in result) {
      const stdout = (result.stdout as string | undefined) ?? "";
      const stderr = (result.stderr as string | undefined) ?? "";
      const interrupted = (result.interrupted as boolean | undefined) ?? false;
      const bashResult: BashResult = { stdout, stderr, interrupted, isImage: false };
      const hasError = stderr && !stdout && !interrupted;
      return {
        success: !hasError,
        summary: summarizeBashResult(bashResult),
      };
    }
  }

  // Fall back to string content analysis
  const isError = isErrorResult(resultContent);
  return {
    success: !isError,
    summary: truncate(resultContent.split("\n")[0] ?? resultContent, MAX_SUMMARY_LENGTH),
  };
}

// =============================================================================
// Main Condenser Functions
// =============================================================================

/**
 * Extract condensed events from an assistant message entry
 */
function condenseAssistantEntry(entry: AssistantMessageEntry): CondensedEvent[] {
  const events: CondensedEvent[] = [];
  const timestamp = entry.timestamp;

  for (const block of entry.message.content) {
    if (isTextContent(block)) {
      const textBlock = block as TextContent;
      if (textBlock.text.trim()) {
        events.push({
          type: "assistant_message",
          timestamp,
          text: truncate(textBlock.text.trim(), MAX_TEXT_LENGTH),
        });
      }
    } else if (isToolUseContent(block)) {
      const toolBlock = block as ToolUseContent;
      events.push({
        type: "tool_use",
        timestamp,
        toolId: toolBlock.id,
        toolName: toolBlock.name,
        summary: summarizeToolUse(toolBlock.name, toolBlock.input),
      });
    }
    // Skip thinking blocks - not useful for memory extraction
  }

  return events;
}

/**
 * Extract condensed events from a user message entry
 */
function condenseUserEntry(entry: UserMessageEntry): CondensedEvent[] {
  const events: CondensedEvent[] = [];
  const timestamp = entry.timestamp;
  const { message, toolUseResult } = entry;

  // Handle string content (direct user message)
  if (typeof message.content === "string") {
    if (message.content.trim()) {
      events.push({
        type: "user_message",
        timestamp,
        text: truncate(message.content.trim(), MAX_TEXT_LENGTH),
      });
    }
    return events;
  }

  // Handle content blocks
  for (const block of message.content) {
    if (isTextContent(block as UserContentBlock)) {
      const textBlock = block as TextContent;
      if (textBlock.text.trim()) {
        events.push({
          type: "user_message",
          timestamp,
          text: truncate(textBlock.text.trim(), MAX_TEXT_LENGTH),
        });
      }
    } else if (isToolResultContent(block as UserContentBlock)) {
      const resultBlock = block as ToolResultContent;
      const { success, summary } = summarizeToolResult(
        toolUseResult,
        resultBlock.content
      );
      events.push({
        type: "tool_result",
        timestamp,
        toolId: resultBlock.tool_use_id,
        success,
        summary,
      });
    }
  }

  return events;
}

/**
 * Parse raw JSONL transcript content and condense it into minimal events
 */
export function condenseTranscript(rawContent: string): CondensedEvent[] {
  const events: CondensedEvent[] = [];
  const lines = rawContent.split("\n");

  for (const line of lines) {
    const entry = parseTranscriptLine(line);
    if (!entry) continue;

    if (isAssistantMessageEntry(entry)) {
      events.push(...condenseAssistantEntry(entry));
    } else if (isUserMessageEntry(entry)) {
      events.push(...condenseUserEntry(entry));
    }
    // Skip system, file-history-snapshot, queue-operation entries
  }

  return events;
}

/**
 * Format condensed events into a string for the memory extraction prompt
 */
export function formatCondensedEvents(events: CondensedEvent[]): string {
  const lines: string[] = [];

  for (const event of events) {
    switch (event.type) {
      case "user_message":
        lines.push(`[User] ${event.text}`);
        break;
      case "assistant_message":
        lines.push(`[Assistant] ${event.text}`);
        break;
      case "tool_use":
        lines.push(`[Tool: ${event.toolName}] ${event.summary}`);
        break;
      case "tool_result":
        lines.push(
          `[Result: ${event.success ? "OK" : "ERROR"}] ${event.summary}`
        );
        break;
    }
  }

  return lines.join("\n");
}

/**
 * Parse and format a transcript for memory extraction
 * This is the main entry point that combines parsing and formatting
 */
export function condenseTranscriptForExtraction(rawContent: string): string {
  const events = condenseTranscript(rawContent);
  return formatCondensedEvents(events);
}
