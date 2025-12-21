---
id: a674bd6d-c0a9-456d-84ed-b3fbd33f1dba
subject: Use --strict-mcp-config to disable MCP during internal subprocess calls
keywords:
  - mcp servers
  - subprocess
  - strict config
  - recursion prevention
applies_to: 'file:src/hooks/user-prompt-submit.ts'
occurred_at: '2025-12-21T18:26:30.211Z'
content_hash: 35e756d8fe7e0a99
---
When calling `claude -p` for internal operations like keyword extraction, add the `--strict-mcp-config` flag to the subprocess command. This disables all MCP servers in that subprocess session, providing an additional layer of protection against recursive hook firing.
