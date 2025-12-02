---
id: ffd7ab1e-8a5a-4d4b-87db-acab816ac47d
subject: Claude project transcripts location on macOS - path format discovery
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - transcript-collector
  - path-conversion
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T15:57:59.296Z'
content_hash: 5fac7d726457cb81
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder name: `Users-joe-Code-Syntessera-local-recall`
- Full transcript path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## Transcript Files

Transcript files are stored as `.jsonl` files (JSON Lines format) with names like:
- `[session-id].jsonl` - Main session transcript

Each line in the file is a complete JSON object representing a single event/message in the session.

## Important for Transcript Processing

This discovery is crucial for the MCP server's background daemon which needs to:
1. Monitor the Claude transcripts directory
2. Parse `.jsonl` files for memory extraction
3. Track which transcripts have been processed using content hashes
4. Re-process transcripts when they change (new lines added)

The path conversion formula allows the MCP server to find transcripts for any project without requiring manual configuration.
