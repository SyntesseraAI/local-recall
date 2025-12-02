---
id: 3abffe5b-9ce0-4ce1-bf89-9b2d6a4de452
subject: Claude project transcripts location and naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - macos
  - cache
  - path-normalization
applies_to: global
occurred_at: '2025-12-01T16:14:32.883Z'
content_hash: 452c1b987abbc661
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Normalization

The project folder name is created by:
1. Taking the absolute working directory path
2. Replacing forward slashes `/` with dashes `-`
3. Replacing dots `.` with dashes `-`

For example: `/Users/joe/Code/Syntessera/local-recall` becomes `Users-joe-Code-Syntessera-local-recall`

## Transcript File Organization

- Transcripts are stored in `~/.claude/projects/<normalized-path>/transcripts/`
- Each transcript is a `.jsonl` file (JSON Lines format)
- Files are named with timestamps

## Accessing Transcripts Programmatically

When implementing transcript processing in the MCP server or hooks:
- Use the `~/.claude/projects/` base directory
- Apply the path normalization rules above
- Read `.jsonl` files to access transcript events
- Each line is a valid JSON object representing a transcript event

## Relevance to Local Recall

The background daemon in the MCP server relies on this information to:
- Locate transcripts from Claude sessions
- Track processed transcripts using content hashes
- Extract memories from recent session activity
- Detect changes in transcripts for re-processing
