---
id: fb1fb8c9-649d-457f-b8ff-4ffe1a4b06ad
subject: Claude project transcripts location and naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - cache
  - path-encoding
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T07:45:18.872Z'
content_hash: 388b598b7cead153
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Encoding Convention

The project folder name encodes the absolute path:
- Slashes (`/`) are replaced with dashes (`-`)
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as JSONL files (one JSON object per line).

This is important for the transcript collector when syncing transcripts from Claude's cache.
