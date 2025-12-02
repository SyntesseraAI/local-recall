---
id: ce3cf489-6fda-4b95-a5be-69c3e4dfebe1
subject: Memory extraction is asynchronous and triggered by the MCP server daemon
keywords:
  - memory-extraction
  - mcp-daemon
  - transcript-processing
  - asynchronous
  - background-processing
applies_to: global
occurred_at: '2025-12-02T02:37:47.579Z'
content_hash: 1fdd891ca75059bd
---
Memory extraction in the local-recall project follows an asynchronous pattern:

1. **Trigger**: The MCP server runs a background daemon (every 5 minutes)
2. **Source**: Daemon reads transcripts from Claude's cache (`~/.claude/projects/<project>/transcripts/`)
3. **Processing**: Uses `extractMemories()` from `memory-extractor.ts` to process each transcript
4. **Deduplication**: Tracks processed transcripts with content hashes to detect changes
5. **Update**: If a transcript changes, old memories are deleted and recreated

This design ensures:
- Memories are extracted without blocking Claude's interaction
- The extraction system can be improved without changing how Claude works
- Transcripts are processed consistently across all sessions
- The daemon can be scaled or optimized independently

Key consideration: The Stop hook is currently disabled in favor of this daemon approach, making memory extraction more reliable and less dependent on session cleanup.
