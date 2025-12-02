---
id: 40a8bf05-1def-4e2a-be3d-3b50dcc2f01e
subject: >-
  Stop hook is currently disabled - memory extraction handled by MCP daemon
  instead
keywords:
  - stop
  - hook
  - disabled
  - memory
  - extraction
  - alternative
applies_to: global
occurred_at: '2025-12-01T16:28:35.007Z'
content_hash: cc032350f6f6d807
---
The Stop hook (called when Claude sessions end) is currently disabled in the local-recall plugin. Memory extraction is instead handled by the MCP server daemon which processes transcripts asynchronously every 5 minutes. This is a deliberate architectural decision to avoid blocking the user experience when sessions end.
