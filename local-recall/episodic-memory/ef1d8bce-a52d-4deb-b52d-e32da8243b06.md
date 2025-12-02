---
id: ef1d8bce-a52d-4deb-b52d-e32da8243b06
subject: >-
  Claude project transcripts stored at ~/.claude/projects/ with path-based
  folder naming
keywords:
  - claude
  - transcripts
  - projects
  - path-conversion
  - jsonl
  - macos
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:06:18.663Z'
content_hash: f69046cdd1a17a61
---
# Claude Project Transcripts Storage

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Folder Naming Convention

Project folders are named using a hash-based path conversion:
- Input: Absolute working directory path (e.g., `/Users/joe/Code/Syntessera/local-recall`)
- Process: Path is hashed to create a unique folder name
- Output: Folder at `~/.claude/projects/<hash-based-folder-name>/`

## Transcript File Format

Transcripts are stored as JSONL (JSON Lines) files where:
- Each line is a separate JSON object representing a turn in the conversation
- Files contain the full conversation history for a session
- Multiple transcript files exist for different sessions with the same project

## Key Discovery

The `transcript-collector.ts` needs to:
1. Convert the current working directory to the hashed folder name
2. Locate transcripts at `~/.claude/projects/<hash>/transcripts/`
3. Parse JSONL format to extract conversation events
4. Use transcript data for memory extraction in the MCP server background daemon

This is essential for the MCP server's background daemon which syncs and processes transcripts every 5 minutes.
