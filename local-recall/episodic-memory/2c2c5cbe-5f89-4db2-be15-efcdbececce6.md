---
id: 2c2c5cbe-5f89-4db2-be15-efcdbececce6
subject: >-
  Claude project transcripts stored at ~/.claude/projects with path-based folder
  names
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - transcript-collector
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T01:48:36.385Z'
content_hash: d4637e4fd56ad513
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Folder name: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Files

Transcripts are stored as `.jsonl` files (JSON Lines format), one line per JSON object. Each line contains a complete transcript event with:
- `type` - Event type (e.g., "user_message", "assistant_response")
- `content` - Event content
- `timestamp` - When the event occurred

## Important Notes

- The transcript collector uses `path.replaceAll('/', '-')` to convert path separators
- This allows the local-recall system to locate and process transcripts for memory extraction
- The MCP server background daemon syncs these transcripts every 5 minutes
