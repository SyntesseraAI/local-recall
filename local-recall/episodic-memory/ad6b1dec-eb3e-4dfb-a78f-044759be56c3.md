---
id: ad6b1dec-eb3e-4dfb-a78f-044759be56c3
subject: Memory extraction uses Claude API with streaming for efficient token usage
keywords:
  - memory-extractor
  - claude-api
  - streaming
  - token-efficiency
  - transcript-processing
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T02:29:20.986Z'
content_hash: 9cedceafbfafb11a
---
The memory extraction system uses `@anthropic-ai/sdk` to call Claude's API with streaming enabled. This approach efficiently processes transcripts by streaming the response, which helps manage token usage when extracting memories from potentially long transcripts. The extractor receives condensed transcript events and uses structured prompts to extract memories.
