---
id: 1e25bbef-e5c5-404f-9f18-b2addcb575ab
subject: Claude project transcripts location and structure on macOS
keywords:
  - claude
  - transcripts
  - projects
  - macos
  - file-path
  - jsonl
  - cache
applies_to: global
occurred_at: '2025-12-01T15:57:04.472Z'
content_hash: 962a63ecfd31c848
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name uses the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Transcript folder: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as JSONL files (one JSON object per line), where each line represents a message or event in the conversation.

## Importance

This is critical for the MCP server's background daemon which syncs and processes transcripts to extract memories automatically.
