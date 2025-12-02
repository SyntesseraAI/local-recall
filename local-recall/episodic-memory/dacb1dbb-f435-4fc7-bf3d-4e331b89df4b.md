---
id: dacb1dbb-f435-4fc7-bf3d-4e331b89df4b
subject: >-
  Memory extraction is handled asynchronously by MCP server daemon every 5
  minutes
keywords:
  - memory extraction
  - mcp server
  - async
  - daemon
  - background process
  - 5 minutes
applies_to: global
occurred_at: '2025-12-01T16:26:33.877Z'
content_hash: d9437cbcf1d95bf6
---
Memory extraction runs asynchronously through the MCP server daemon rather than in the Stop hook. The daemon processes transcripts every 5 minutes, which is more efficient than extracting memories synchronously at session end. This allows the Stop hook to complete quickly without blocking.
