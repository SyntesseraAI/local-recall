---
id: edfdecd4-788f-4274-93dd-fee178db3a7d
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
occurred_at: '2025-12-01T22:20:46.735Z'
content_hash: 0ab704d0f94d9f7f
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder name: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Files

Transcripts are stored as JSONL files (one JSON object per line) with format:
- `session_id`: UUID identifier
- `timestamp`: ISO-8601 timestamp
- `type`: Event type (e.g., "user_message", "assistant_message")
- `content`: Message content

This is useful for the transcript-collector module which processes these files to extract memories asynchronously.
