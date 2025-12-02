---
id: baf337ac-ff8b-4619-ac78-c87ad9a5bcf4
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
occurred_at: '2025-12-01T16:13:17.808Z'
content_hash: 7c25543b8977eeed
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

Transcripts are stored in `.jsonl` format (JSON Lines - one JSON object per line).

## Relevant Code

The `transcript-collector.ts` file handles reading and processing these transcripts for memory extraction.
