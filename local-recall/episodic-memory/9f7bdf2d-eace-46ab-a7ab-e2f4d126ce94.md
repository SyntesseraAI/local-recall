---
id: 9f7bdf2d-eace-46ab-a7ab-e2f4d126ce94
subject: >-
  MCP server exposes memory tools and runs background daemon for transcript
  processing
keywords:
  - mcp
  - server
  - daemon
  - transcript
  - background
applies_to: global
occurred_at: '2025-12-02T12:54:18.462Z'
content_hash: eb8ac27ab16c4c73
---
The MCP server runs a background daemon that processes transcripts from Claude's cache every 5 minutes. Available tools: `memory_create`, `memory_get`, `memory_search`, `memory_list`, `index_rebuild`. The daemon syncs transcripts, extracts memories via `claude -p`, tracks processed transcripts with content hashes for change detection, and deletes/recreates memories when transcripts change.
