---
id: 29fa77fd-dd07-4fcd-ad46-a8c631dd3ec7
subject: >-
  Claude project transcripts location on macOS - path format uses dashes instead
  of slashes
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - transcript-collector
  - path-format
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:03:05.859Z'
content_hash: ba36e8c37257206f
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path with:
- Leading slash `/` removed
- All slashes `/` replaced with dashes `-`
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `Users-joe-Code-Syntessera-local-recall`

## Transcript Files

Transcript files are stored as JSONL (JSON Lines) format in:
`~/.claude/projects/{project-folder}/transcripts/`

This is important for the transcript-collector functionality which needs to locate and process transcripts.
