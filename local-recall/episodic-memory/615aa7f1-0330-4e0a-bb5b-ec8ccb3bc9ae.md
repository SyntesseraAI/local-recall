---
id: 615aa7f1-0330-4e0a-bb5b-ec8ccb3bc9ae
subject: >-
  Transcript types schema provides JSONL structure for Claude Code cache
  transcripts
keywords:
  - transcript-schema
  - jsonl
  - types
  - claude-code
  - transcript-structure
applies_to: 'file:src/types/transcript-schema.ts'
occurred_at: '2025-12-21T18:30:38.769Z'
content_hash: c527e815c3951f80
---
Created comprehensive TypeScript types for parsing Claude Code transcript JSONL files. The schema includes:

**Entry types:**
- `UserEntry`: User messages
- `AssistantEntry`: Claude responses with content blocks
- `SystemEntry`: System messages
- `FileHistorySnapshot`: File change history
- `QueueOperation`: Tool/agent invocations

**Content block types:**
- `TextBlock`: Plain text
- `ThinkingBlock`: Internal reasoning
- `ToolUseBlock`: Tool invocations
- `ToolResultBlock`: Tool results

**Key properties:**
- Each entry has `timestamp` and `type` for sequencing
- `content` is an array of content blocks
- Metadata includes session info, turn count, and model info

This schema is essential for the transcript condenser to properly parse and extract relevant content.
