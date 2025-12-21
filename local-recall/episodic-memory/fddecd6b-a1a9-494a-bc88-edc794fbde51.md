---
id: fddecd6b-a1a9-494a-bc88-edc794fbde51
subject: >-
  Subject generation uses first line for multiline text, first sentence for
  single-line
keywords:
  - subject generation
  - text summarization
  - memory metadata
applies_to: 'file:src/utils/summarize.ts'
occurred_at: '2025-12-21T18:18:43.074Z'
content_hash: fd7c3df9ce0a65d8
---
The `generateSubject()` function has been simplified:
- **Multi-line text**: Extract and return the first line
- **Single-line text**: Extract text up to the first `.!?` (sentence end), or return all text if no sentence delimiter exists

This replaces the previous `ts-textrank` NLP-based approach with simple, deterministic logic that's easier to understand and test.
