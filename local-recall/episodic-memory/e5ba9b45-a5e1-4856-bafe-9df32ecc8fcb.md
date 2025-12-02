---
id: e5ba9b45-a5e1-4856-bafe-9df32ecc8fcb
subject: MCP server background daemon processes transcripts every 5 minutes
keywords:
  - mcp server
  - background daemon
  - transcript processing
  - interval
  - schedule
applies_to: 'area:mcp-server'
occurred_at: '2025-12-01T16:08:34.913Z'
content_hash: 30a21e038ebfe029
---
The MCP server runs a background daemon that processes transcripts asynchronously. It checks for new/modified transcripts every 5 minutes, extracts memories using `claude -p`, tracks processing state with content hashes, and deletes/recreates memories when transcripts change. This enables offline memory extraction without blocking Claude Code sessions.
