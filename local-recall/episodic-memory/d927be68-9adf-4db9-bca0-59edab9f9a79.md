---
id: d927be68-9adf-4db9-bca0-59edab9f9a79
subject: >-
  Claude Code transcripts are stored in
  ~/.claude/projects/<project>/transcripts/
keywords:
  - claude
  - transcripts
  - storage
  - path
  - project
  - cache
applies_to: global
occurred_at: '2025-12-01T16:20:33.424Z'
content_hash: aa3756a44363d420
---
Claude Code stores session transcripts in the user's home directory under `~/.claude/projects/<project>/transcripts/`. These transcripts are used by the MCP server daemon to extract memories asynchronously every 5 minutes. The MCP server syncs transcripts from this cache location and processes them using `claude -p` to extract memories.
