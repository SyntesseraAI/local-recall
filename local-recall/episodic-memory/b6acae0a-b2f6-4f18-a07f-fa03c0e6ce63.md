---
id: b6acae0a-b2f6-4f18-a07f-fa03c0e6ce63
subject: Claude's transcript cache location and project naming convention
keywords:
  - claude
  - transcript
  - cache
  - projects
  - disk location
  - project naming
  - jsonl
  - sync
applies_to: global
occurred_at: '2025-12-01T16:16:18.346Z'
content_hash: 1cc232e472e24e3d
---
Claude stores project transcripts in `~/.claude/projects/` directory. Project directories are named with URL-encoded paths where slashes become dashes, matching the repo folder name. Example: `/Users/joe/.claude/projects/-Users-joe-Code-Syntessera-local-recall/` contains transcripts in JSONL format. This is important for the MCP server's background daemon which syncs transcripts from this location.
