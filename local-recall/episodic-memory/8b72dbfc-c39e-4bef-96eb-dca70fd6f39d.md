---
id: 8b72dbfc-c39e-4bef-96eb-dca70fd6f39d
subject: Claude project transcripts location on macOS
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - cache
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T15:55:43.988Z'
content_hash: 7254d56f3e44fd85
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder name: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Files

Transcripts are stored as JSONL files with names like:
- `transcript-2024-12-01-160000.jsonl` (date-time format)

Each line is a JSON object representing a single event in the transcript.

## Relevance

This is important for the MCP server's background daemon which needs to locate and process transcripts for memory extraction.
