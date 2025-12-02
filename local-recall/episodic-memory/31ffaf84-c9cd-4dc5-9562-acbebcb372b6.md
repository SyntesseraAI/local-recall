---
id: 31ffaf84-c9cd-4dc5-9562-acbebcb372b6
subject: Memory extraction process uses claude -p command to analyze transcripts
keywords:
  - memory extraction
  - claude -p
  - transcript analysis
  - prompt
  - mcp server
  - daemon
  - async processing
applies_to: global
occurred_at: '2025-12-01T16:18:36.431Z'
content_hash: 0ffe5cd5dee4da6d
---
The MCP server daemon uses `claude -p` (prompt mode) to analyze transcripts and extract memories. This command allows passing transcript content to Claude's inference engine for intelligent memory extraction. The daemon runs asynchronously every 5 minutes and processes transcripts that have changed (detected via content hashes) to avoid re-processing unchanged transcripts.
