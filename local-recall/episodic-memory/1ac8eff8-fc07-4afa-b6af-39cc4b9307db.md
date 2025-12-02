---
id: 1ac8eff8-fc07-4afa-b6af-39cc4b9307db
subject: Memory extraction uses Claude Haiku with streaming for processing transcripts
keywords:
  - memory extraction
  - claude haiku
  - streaming
  - transcript processing
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T15:53:43.071Z'
content_hash: 997d648e28b4deb5
---
The memory extraction system in `src/core/memory-extractor.ts` uses Claude Haiku model with streaming to process transcripts and extract valuable memories. The extractor calls the Anthropic API with the `claude-3-5-haiku-20241022` model and uses streaming responses for efficient processing of transcript content.
