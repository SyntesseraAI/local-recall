---
id: b1cc4a1d-636d-484f-bac3-fc6df2d5bcbb
subject: Claude project transcripts location and path format on macOS
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
occurred_at: '2025-12-01T16:23:22.037Z'
content_hash: 9cfb497ee1c6d9f6
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path:
- Path: `/Users/joe/Code/Syntessera/local-recall`
- Folder name: `Users-joe-Code-Syntessera-local-recall` (slashes converted to hyphens)
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as `.jsonl` files (JSON Lines format), one per session.

This is critical for the transcript-collector to locate and process session transcripts.
