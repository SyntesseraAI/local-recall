---
id: 7fcbcde9-fe5d-4f3a-8eee-8e94449c10f1
subject: Claude project transcripts location follows path-to-folder-name convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - path-convention
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:18:29.874Z'
content_hash: 8876bc2a961ccfb7
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Files

Transcripts are stored as JSONL files within this directory, where each line is a JSON event representing:
- User input
- Assistant responses
- Tool invocations and results
- Session metadata

## Usage in local-recall

The transcript-collector module reads from this location to extract memories and track processed transcripts via content hashes for deduplication.
