---
id: acfc4946-1f93-45bc-bc50-d8328fcdaebe
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
occurred_at: '2025-12-01T16:14:38.978Z'
content_hash: cf87f44cab5a4c93
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as JSONL (JSON Lines) files where each line is a JSON object representing a single event in the transcript.

## Relevant for MCP Server

The MCP server's background daemon uses this path to sync transcripts for memory extraction. The path can be computed by replacing slashes in the absolute working directory path with dashes.
