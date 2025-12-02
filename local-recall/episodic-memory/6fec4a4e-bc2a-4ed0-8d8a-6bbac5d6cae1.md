---
id: 6fec4a4e-bc2a-4ed0-8d8a-6bbac5d6cae1
subject: >-
  MCP server runs background daemon syncing transcripts and extracting memories
  every 5 minutes
keywords:
  - mcp-server
  - background-daemon
  - transcript-sync
  - memory-extraction
  - daemon-process
applies_to: global
occurred_at: '2025-12-02T11:42:12.112Z'
content_hash: 722d7c63a1f57142
---
The MCP server includes a background daemon that: (1) syncs transcripts from Claude's cache (`~/.claude/projects/<project>/transcripts/`), (2) processes transcripts using `claude -p` to extract memories, (3) tracks processed transcripts with content hashes for change detection, (4) deletes and recreates memories when transcripts change, (5) runs every 5 minutes. This allows memory extraction without blocking the Stop hook.
