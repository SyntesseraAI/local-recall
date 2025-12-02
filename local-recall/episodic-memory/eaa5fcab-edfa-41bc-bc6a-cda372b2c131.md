---
id: eaa5fcab-edfa-41bc-bc6a-cda372b2c131
subject: Claude project transcripts location on macOS - path format discovery
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - cache
  - transcript-collector
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T01:42:53.469Z'
content_hash: b9de79a4a871fa0f
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full transcript path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

Transcripts are stored as `.jsonl` files (JSON Lines format) with the session ID as filename.

## Importance

This path format is critical for the transcript-collector to locate and process Claude Code transcripts for memory extraction.
