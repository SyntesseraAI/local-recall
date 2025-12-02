---
id: b51de8ad-2cd3-4e28-bced-bcc78106ed11
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
occurred_at: '2025-12-01T16:29:55.577Z'
content_hash: 830556d19aa271c6
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as `.jsonl` (JSON Lines) files where each line is a separate JSON object representing an event in the conversation.
