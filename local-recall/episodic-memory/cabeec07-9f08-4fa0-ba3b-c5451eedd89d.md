---
id: cabeec07-9f08-4fa0-ba3b-c5451eedd89d
subject: Claude project transcripts location and path format on macOS
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - path-format
  - transcript-collector
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T15:54:16.841Z'
content_hash: b7f058e1d27ffd1c
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Transcripts stored at: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Format

Transcripts are stored as `.jsonl` files (JSON Lines format), one event per line.

## Relevance

This is important for the transcript-collector and MCP server components that need to locate and process Claude's session transcripts for memory extraction.
