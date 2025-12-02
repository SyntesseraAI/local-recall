---
id: dac4c443-dcde-47df-9e5d-c95f6631aa5a
subject: Transcript structure in Claude Code projects
keywords:
  - transcript
  - format
  - jsonl
  - event
  - structure
  - messages
  - tools
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T23:01:53.963Z'
content_hash: 1fc006be68f961fe
---
# Transcript Structure in Claude Code

Claude Code transcripts are stored as JSONL (JSON Lines) files where each line is a JSON object representing a transcript event.

## Event Types

Transcripts contain events with these main types:
- `text` - Text content from user or assistant
- `tool_use` - Tool invocations and results
- `system` - System messages or metadata

## Event Structure

Each event typically has:
- `type` - Event type (e.g., 'text', 'tool_use')
- `role` - Actor ('user', 'assistant', or 'system')
- `content` - Event content (varies by type)
- `timestamp` - When the event occurred

## Usage in Local Recall

The `TranscriptCollector` reads these JSONL files to extract:
- User requests and assistant responses
- Tool usage patterns
- Context about what was being worked on

This information is used to generate structured memories for future sessions.
