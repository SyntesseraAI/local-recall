---
id: aadbccff-d214-4aaf-aa5d-e799bd442fa3
subject: Claude project transcripts location and naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - macos
  - cache
  - naming-convention
applies_to: global
occurred_at: '2025-12-01T16:13:17.473Z'
content_hash: c9d3b97310a1417d
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working path with slashes replaced by dashes.

Example: For working directory `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`
- Transcripts are stored as `.jsonl` files

## Key Points

- Transcripts are JSONL format (newline-delimited JSON)
- Each transcript contains session events and user prompts
- The MCP server processes transcripts asynchronously
- Transcripts should be parsed with proper JSONL line-by-line reading
