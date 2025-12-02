---
id: 91e3c867-1a1d-4acf-8ef1-5f7acd0db5cb
subject: >-
  Memory extraction uses Claude Haiku via fetch API with streaming response
  handling
keywords:
  - memory-extractor
  - claude-api
  - streaming
  - fetch
  - haiku
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T07:26:15.522Z'
content_hash: 44c1a86638326a38
---
The memory extraction system in `memory-extractor.ts` uses the Anthropic fetch API to communicate with Claude Haiku for extracting memories from transcripts. The implementation handles streaming responses and processes them line-by-line using a custom line-splitter utility. The API call includes proper error handling for network failures and malformed responses.
