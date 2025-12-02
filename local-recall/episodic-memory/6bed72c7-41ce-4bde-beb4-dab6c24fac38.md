---
id: 6bed72c7-41ce-4bde-beb4-dab6c24fac38
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
occurred_at: '2025-12-02T01:50:10.272Z'
content_hash: 30d45eb74906c40c
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Folder name: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

## File Format

Transcripts are stored as `.jsonl` files with one JSON object per line, containing:
- `role`: "user" or "assistant"
- `content`: The message text
- `timestamp`: ISO-8601 timestamp

## Usage in Local Recall

The transcript collector (`src/core/transcript-collector.ts`) uses this location to:
1. Find and read project transcripts
2. Extract memories from Claude's session history
3. Track processed transcripts with content hashes for deduplication
4. Create episodic memories based on conversation content
