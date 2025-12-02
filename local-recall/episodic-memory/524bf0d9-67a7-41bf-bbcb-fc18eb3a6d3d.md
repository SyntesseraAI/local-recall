---
id: 524bf0d9-67a7-41bf-bbcb-fc18eb3a6d3d
subject: Claude project transcripts location and format on macOS
keywords:
  - claude
  - transcripts
  - projects
  - macos
  - file-path
  - jsonl
  - cache
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T21:15:09.901Z'
content_hash: d55db48efd442dbf
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes. For example:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Claude project folder: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/`
- Transcripts JSONL file: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/default.jsonl`

## Transcript Format

Transcripts are stored as JSONL (JSON Lines) format where each session is a separate JSON object on its own line. Each transcript entry contains:
- Session metadata (session_id, timestamps)
- Conversation history (user messages and assistant responses)
- Tool invocations and results

This is the data source for the local-recall memory extraction system.
