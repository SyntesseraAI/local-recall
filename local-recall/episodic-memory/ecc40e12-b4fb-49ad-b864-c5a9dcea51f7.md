---
id: ecc40e12-b4fb-49ad-b864-c5a9dcea51f7
subject: >-
  Memory extraction uses Claude Haiku with streaming and handles API errors
  gracefully
keywords:
  - memory-extractor
  - claude-haiku
  - streaming
  - error-handling
  - api-integration
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:29:56.572Z'
content_hash: b8813c7d7594739f
---
The memory extraction system in memory-extractor.ts uses Claude Haiku model with streaming enabled via `stream: true` in the API request. The implementation includes comprehensive error handling for API failures with a try-catch block wrapping the Claude API call. When parsing fails or API errors occur, the extractor gracefully handles errors rather than crashing, allowing the system to continue processing other transcripts.
