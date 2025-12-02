---
id: dfe9aab4-b0b8-4d03-88fb-dc30bae362dd
subject: >-
  Memory extraction from transcripts is asynchronous and handled by MCP server
  daemon
keywords:
  - memory-extraction
  - transcript-processing
  - mcp-server
  - background-daemon
  - async
  - memory-lifecycle
applies_to: global
occurred_at: '2025-12-02T02:20:20.792Z'
content_hash: d8a656ae1b2e5433
---
# Asynchronous Memory Extraction Process

## Current Design
Memory extraction is NOT handled by the Stop hook. Instead:
1. The MCP server runs as a background daemon
2. It processes transcripts asynchronously every 5 minutes
3. The daemon syncs transcripts from Claude's cache
4. Tracks processed transcripts with content hashes for change detection
5. Creates or updates memories based on transcript content

## Stop Hook Status
The Stop hook is currently **disabled**. Memory extraction happens in the background, not on session end.

## Implications for Development
- Memory extraction happens outside of session lifecycle
- Tests should account for async processing
- The memory lifecycle is independent of Claude Code sessions
- Transcript changes trigger re-processing and memory updates
