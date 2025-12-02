---
id: bc6e1fa8-e9ce-41f4-a759-7baccbfece5a
subject: >-
  Memory extraction process uses Claude Haiku with streaming and transcript
  condensing
keywords:
  - memory extraction
  - claude haiku
  - streaming
  - transcript condensing
  - mcp server
applies_to: global
occurred_at: '2025-12-01T15:56:42.885Z'
content_hash: 6ae36fb8c7d0397a
---
The memory extraction system in the MCP server uses Claude Haiku model to extract memories from session transcripts. The process includes:

1. Transcript condensing - transcripts are condensed to reduce token count before sending to Claude
2. Streaming response - Claude's response is streamed to handle large outputs
3. Memory creation - extracted memories are created using the memory manager
4. Duplicate checking - memories are deduplicated using `findDuplicate()` with `occurred_at` and `content_hash`

Location: `src/core/memory-extractor.ts`
