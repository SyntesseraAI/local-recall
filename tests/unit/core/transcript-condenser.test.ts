import { describe, it, expect } from "vitest";
import {
  condenseTranscript,
  formatCondensedEvents,
  condenseTranscriptForExtraction,
  type CondensedEvent,
} from "../../../src/core/transcript-condenser.js";

// Sample JSONL transcript entries for testing
const sampleUserMessage = JSON.stringify({
  type: "user",
  timestamp: "2025-01-15T10:00:00.000Z",
  message: {
    role: "user",
    content: "How do I add authentication to the app?",
  },
  uuid: "user-1",
  parentUuid: null,
  isSidechain: false,
  userType: "external",
  cwd: "/test/project",
  sessionId: "session-1",
  version: "1.0.0",
  gitBranch: "main",
});

const sampleAssistantTextMessage = JSON.stringify({
  type: "assistant",
  timestamp: "2025-01-15T10:00:05.000Z",
  message: {
    model: "claude-3-opus",
    id: "msg-1",
    type: "message",
    role: "assistant",
    content: [
      {
        type: "text",
        text: "I'll help you add authentication. Let me first read the current auth configuration.",
      },
    ],
    stop_reason: null,
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      service_tier: "default",
    },
  },
  uuid: "assistant-1",
  parentUuid: "user-1",
  isSidechain: false,
  userType: "external",
  cwd: "/test/project",
  sessionId: "session-1",
  version: "1.0.0",
  gitBranch: "main",
  requestId: "req-1",
});

const sampleToolUseMessage = JSON.stringify({
  type: "assistant",
  timestamp: "2025-01-15T10:00:10.000Z",
  message: {
    model: "claude-3-opus",
    id: "msg-2",
    type: "message",
    role: "assistant",
    content: [
      {
        type: "tool_use",
        id: "tool-1",
        name: "Read",
        input: {
          file_path: "/test/project/src/auth/config.ts",
        },
      },
    ],
    stop_reason: null,
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      service_tier: "default",
    },
  },
  uuid: "assistant-2",
  parentUuid: "assistant-1",
  isSidechain: false,
  userType: "external",
  cwd: "/test/project",
  sessionId: "session-1",
  version: "1.0.0",
  gitBranch: "main",
  requestId: "req-2",
});

const sampleToolResultMessage = JSON.stringify({
  type: "user",
  timestamp: "2025-01-15T10:00:15.000Z",
  message: {
    role: "user",
    content: [
      {
        type: "tool_result",
        tool_use_id: "tool-1",
        content: "export const authConfig = { provider: 'oauth' };",
      },
    ],
  },
  toolUseResult: {
    type: "text",
    file: {
      filePath: "/test/project/src/auth/config.ts",
      content: "export const authConfig = { provider: 'oauth' };",
      numLines: 1,
      startLine: 1,
      totalLines: 1,
    },
  },
  uuid: "user-2",
  parentUuid: "assistant-2",
  isSidechain: false,
  userType: "external",
  cwd: "/test/project",
  sessionId: "session-1",
  version: "1.0.0",
  gitBranch: "main",
});

const sampleThinkingMessage = JSON.stringify({
  type: "assistant",
  timestamp: "2025-01-15T10:00:20.000Z",
  message: {
    model: "claude-3-opus",
    id: "msg-3",
    type: "message",
    role: "assistant",
    content: [
      {
        type: "thinking",
        thinking: "This is internal reasoning that should be skipped in condensed output.",
        signature: "sig-123",
      },
      {
        type: "text",
        text: "Based on the auth config, I can see you're using OAuth.",
      },
    ],
    stop_reason: null,
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
      service_tier: "default",
    },
  },
  uuid: "assistant-3",
  parentUuid: "user-2",
  isSidechain: false,
  userType: "external",
  cwd: "/test/project",
  sessionId: "session-1",
  version: "1.0.0",
  gitBranch: "main",
  requestId: "req-3",
});

const sampleFileHistorySnapshot = JSON.stringify({
  type: "file-history-snapshot",
  messageId: "snap-1",
  isSnapshotUpdate: false,
  snapshot: {
    messageId: "snap-1",
    timestamp: "2025-01-15T10:00:25.000Z",
    trackedFileBackups: {},
  },
});

describe("transcript-condenser", () => {
  describe("condenseTranscript", () => {
    it("should extract user messages", () => {
      const events = condenseTranscript(sampleUserMessage);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "user_message",
        text: "How do I add authentication to the app?",
      });
    });

    it("should extract assistant text messages", () => {
      const events = condenseTranscript(sampleAssistantTextMessage);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "assistant_message",
        text: "I'll help you add authentication. Let me first read the current auth configuration.",
      });
    });

    it("should extract tool uses with summary", () => {
      const events = condenseTranscript(sampleToolUseMessage);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "tool_use",
        toolName: "Read",
        summary: "Read /test/project/src/auth/config.ts",
      });
    });

    it("should extract tool results with success status", () => {
      const events = condenseTranscript(sampleToolResultMessage);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "tool_result",
        toolId: "tool-1",
        success: true,
      });
    });

    it("should skip thinking content blocks", () => {
      const events = condenseTranscript(sampleThinkingMessage);

      // Should have 1 event (text), not 2 (thinking + text)
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: "assistant_message",
        text: "Based on the auth config, I can see you're using OAuth.",
      });
    });

    it("should skip file-history-snapshot entries", () => {
      const events = condenseTranscript(sampleFileHistorySnapshot);
      expect(events).toHaveLength(0);
    });

    it("should handle multiple lines of JSONL", () => {
      const multipleLines = [
        sampleUserMessage,
        sampleAssistantTextMessage,
        sampleToolUseMessage,
        sampleToolResultMessage,
      ].join("\n");

      const events = condenseTranscript(multipleLines);

      expect(events).toHaveLength(4);
      expect(events[0]?.type).toBe("user_message");
      expect(events[1]?.type).toBe("assistant_message");
      expect(events[2]?.type).toBe("tool_use");
      expect(events[3]?.type).toBe("tool_result");
    });

    it("should skip malformed lines gracefully", () => {
      const withMalformed = [
        sampleUserMessage,
        "{ invalid json",
        sampleAssistantTextMessage,
      ].join("\n");

      const events = condenseTranscript(withMalformed);
      expect(events).toHaveLength(2);
    });
  });

  describe("formatCondensedEvents", () => {
    it("should format user messages correctly", () => {
      const events: CondensedEvent[] = [
        {
          type: "user_message",
          timestamp: "2025-01-15T10:00:00.000Z",
          text: "Hello world",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[User] Hello world");
    });

    it("should format assistant messages correctly", () => {
      const events: CondensedEvent[] = [
        {
          type: "assistant_message",
          timestamp: "2025-01-15T10:00:00.000Z",
          text: "I can help with that",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[Assistant] I can help with that");
    });

    it("should format tool uses correctly", () => {
      const events: CondensedEvent[] = [
        {
          type: "tool_use",
          timestamp: "2025-01-15T10:00:00.000Z",
          toolId: "tool-1",
          toolName: "Read",
          summary: "Read /path/to/file.ts",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[Tool: Read] Read /path/to/file.ts");
    });

    it("should format tool results correctly", () => {
      const events: CondensedEvent[] = [
        {
          type: "tool_result",
          timestamp: "2025-01-15T10:00:00.000Z",
          toolId: "tool-1",
          success: true,
          summary: "Read 50 lines from /path/to/file.ts",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[Result: OK] Read 50 lines from /path/to/file.ts");
    });

    it("should format error results correctly", () => {
      const events: CondensedEvent[] = [
        {
          type: "tool_result",
          timestamp: "2025-01-15T10:00:00.000Z",
          toolId: "tool-1",
          success: false,
          summary: "File not found",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[Result: ERROR] File not found");
    });

    it("should join multiple events with newlines", () => {
      const events: CondensedEvent[] = [
        {
          type: "user_message",
          timestamp: "2025-01-15T10:00:00.000Z",
          text: "Question",
        },
        {
          type: "assistant_message",
          timestamp: "2025-01-15T10:00:01.000Z",
          text: "Answer",
        },
      ];

      const formatted = formatCondensedEvents(events);
      expect(formatted).toBe("[User] Question\n[Assistant] Answer");
    });
  });

  describe("condenseTranscriptForExtraction", () => {
    it("should parse and format in one step", () => {
      const result = condenseTranscriptForExtraction(sampleUserMessage);
      expect(result).toBe("[User] How do I add authentication to the app?");
    });

    it("should handle complete conversation", () => {
      const fullConversation = [
        sampleUserMessage,
        sampleAssistantTextMessage,
        sampleToolUseMessage,
        sampleToolResultMessage,
      ].join("\n");

      const result = condenseTranscriptForExtraction(fullConversation);
      const lines = result.split("\n");

      expect(lines).toHaveLength(4);
      expect(lines[0]).toContain("[User]");
      expect(lines[1]).toContain("[Assistant]");
      expect(lines[2]).toContain("[Tool: Read]");
      expect(lines[3]).toContain("[Result: OK]");
    });
  });

  describe("tool summarization", () => {
    it("should summarize Edit tool", () => {
      const editToolMessage = JSON.stringify({
        type: "assistant",
        timestamp: "2025-01-15T10:00:00.000Z",
        message: {
          model: "claude-3-opus",
          id: "msg-1",
          type: "message",
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Edit",
              input: {
                file_path: "/test/file.ts",
                old_string: "const foo = 1;",
                new_string: "const foo = 2;",
              },
            },
          ],
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
            cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
            service_tier: "default",
          },
        },
        uuid: "assistant-1",
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/test/project",
        sessionId: "session-1",
        version: "1.0.0",
        gitBranch: "main",
        requestId: "req-1",
      });

      const events = condenseTranscript(editToolMessage);
      expect(events[0]).toMatchObject({
        type: "tool_use",
        toolName: "Edit",
        summary: expect.stringContaining("/test/file.ts"),
      });
    });

    it("should summarize Bash tool with description", () => {
      const bashToolMessage = JSON.stringify({
        type: "assistant",
        timestamp: "2025-01-15T10:00:00.000Z",
        message: {
          model: "claude-3-opus",
          id: "msg-1",
          type: "message",
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Bash",
              input: {
                command: "npm run build",
                description: "Build the project",
              },
            },
          ],
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
            cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
            service_tier: "default",
          },
        },
        uuid: "assistant-1",
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/test/project",
        sessionId: "session-1",
        version: "1.0.0",
        gitBranch: "main",
        requestId: "req-1",
      });

      const events = condenseTranscript(bashToolMessage);
      expect(events[0]).toMatchObject({
        type: "tool_use",
        toolName: "Bash",
        summary: "Bash: Build the project (npm run build)",
      });
    });

    it("should summarize Grep tool", () => {
      const grepToolMessage = JSON.stringify({
        type: "assistant",
        timestamp: "2025-01-15T10:00:00.000Z",
        message: {
          model: "claude-3-opus",
          id: "msg-1",
          type: "message",
          role: "assistant",
          content: [
            {
              type: "tool_use",
              id: "tool-1",
              name: "Grep",
              input: {
                pattern: "TODO",
                path: "/test/project/src",
                glob: "*.ts",
              },
            },
          ],
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0,
            cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
            service_tier: "default",
          },
        },
        uuid: "assistant-1",
        parentUuid: null,
        isSidechain: false,
        userType: "external",
        cwd: "/test/project",
        sessionId: "session-1",
        version: "1.0.0",
        gitBranch: "main",
        requestId: "req-1",
      });

      const events = condenseTranscript(grepToolMessage);
      expect(events[0]).toMatchObject({
        type: "tool_use",
        toolName: "Grep",
        summary: 'Grep: "TODO" in /test/project/src (*.ts)',
      });
    });
  });
});
