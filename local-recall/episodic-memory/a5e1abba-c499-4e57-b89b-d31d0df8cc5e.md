---
id: a5e1abba-c499-4e57-b89b-d31d0df8cc5e
subject: Memory extraction uses Claude API with streaming and transcript condensing
keywords:
  - memory-extractor
  - streaming
  - transcript condensing
  - claude api
  - memory extraction
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T15:59:49.323Z'
content_hash: 088eefab4b2d3ef2
---
The memory extraction system in memory-extractor.ts uses the Claude API with streaming enabled to process transcripts and extract memories. The system implements transcript condensing to summarize long sessions before memory extraction, reducing token usage. Key components:

- Uses `Anthropic` client to call Claude models
- Implements streaming with event handlers for 'contentBlockStart', 'contentBlockDelta', 'contentBlockStop'
- Tracks content blocks and accumulates streamed text
- Uses transcript condensing via `condenseTranscript()` before extraction
- Parses streamed JSON responses from Claude
- Handles memory creation with deduplication checks
