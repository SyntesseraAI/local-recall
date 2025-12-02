---
id: a6aabdf7-228c-4cb5-ab93-c3233dffed50
subject: Claude project transcripts location and naming convention on macOS
keywords:
  - claude
  - transcripts
  - projects
  - macos
  - file-path
  - cache
  - project-folder-naming
applies_to: global
occurred_at: '2025-12-02T01:44:56.436Z'
content_hash: 4a4ccfce8ba4cccd
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is created by taking the absolute path and replacing slashes with dashes:
- Example: `/Users/joe/Code/Syntessera/local-recall` → `-Users-joe-Code-Syntessera-local-recall`
- Full transcript path: `~/.claude/projects/-Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as JSONL (JSON Lines) files with:
- One message per line
- Each line contains: `{"type": "user"|"assistant", "text": "...", "timestamp": ...}`
- Timestamp is in ISO-8601 format

## Usage in Local Recall

The transcript collector reads from this location to extract memories and build the memory index. This is critical for the MCP server's background daemon which processes transcripts every 5 minutes.
