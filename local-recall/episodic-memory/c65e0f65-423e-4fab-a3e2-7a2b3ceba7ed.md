---
id: c65e0f65-423e-4fab-a3e2-7a2b3ceba7ed
subject: Claude project transcripts location and path format on macOS
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - transcript-collector
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T15:53:28.282Z'
content_hash: 9e5654dd0cfd35b0
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder name: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as JSONL (JSON Lines) files with extension `.jsonl` containing individual session events.
