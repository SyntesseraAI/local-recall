---
id: adfdecf0-ffae-497b-a48b-65b2e3a6adc2
subject: Claude project transcripts location and naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - naming-convention
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T07:21:22.938Z'
content_hash: 2b630c9b8537397f
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes, and the folder contains:
- `transcripts/` subdirectory
- `transcripts.jsonl` file (single JSONL file containing all transcripts)

## Example

For a project at `/Users/joe/Code/Syntessera/local-recall`:
- Folder: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/`
- Transcripts: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts.jsonl`

This is critical for the transcript collector to locate and process project transcripts correctly.
