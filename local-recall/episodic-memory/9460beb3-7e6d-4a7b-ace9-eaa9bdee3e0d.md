---
id: 9460beb3-7e6d-4a7b-ace9-eaa9bdee3e0d
subject: Claude project transcripts location and structure
keywords:
  - claude
  - transcripts
  - projects
  - macos
  - jsonl
  - path-encoding
  - cache-directory
applies_to: global
occurred_at: '2025-12-01T15:53:05.903Z'
content_hash: 4abf8a9610a3e73b
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Encoding

Project folder names encode the absolute working directory path with slashes replaced by dashes and spaces replaced by underscores:
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `_Users_joe_Code_Syntessera_local-recall`

## Transcript Files

Transcripts are stored as JSONL (JSON Lines) files where each line is a complete JSON object representing one event in the session.

## Key Fields in Transcript Events

- `type`: Event type (e.g., 'user_message', 'assistant_message', 'tool_call')
- `timestamp`: ISO-8601 timestamp of when the event occurred
- `content`: The actual message or tool invocation content

This structure enables efficient streaming and processing of transcript data.
