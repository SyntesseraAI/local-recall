---
id: 1a9b19af-41cf-4e02-9fed-95a8f2a3aabb
subject: MCP server runs as background daemon processing transcripts asynchronously
keywords:
  - mcp-server
  - daemon
  - background-processing
  - transcripts
  - memory-extraction
applies_to: 'file:src/mcp-server/server.ts'
occurred_at: '2025-12-01T16:29:11.076Z'
content_hash: e90b0ac7b12c0f06
---
The MCP server runs a background daemon that:
- Syncs transcripts from Claude's cache (`~/.claude/projects/<project>/transcripts/`)
- Processes transcripts using `claude -p` to extract memories
- Tracks processed transcripts with content hashes for change detection
- Deletes and recreates memories when transcripts change
- Runs every 5 minutes

The Stop hook is currently disabled in favor of this asynchronous approach.
