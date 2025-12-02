---
id: 2ae7dc6a-3c5e-45fe-a0ab-da7f75f987fc
subject: >-
  Memory extraction uses Claude Haiku with structured prompt for parsing
  transcripts
keywords:
  - memory extraction
  - claude haiku
  - transcript parsing
  - memory-extractor.ts
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T22:19:54.503Z'
content_hash: 08e02bad94c1dbc4
---
The `MemoryExtractor` class in `src/core/memory-extractor.ts` uses Claude Haiku to parse session transcripts and extract memories. It sends the transcript to Claude with a detailed prompt that asks Claude to analyze the transcript and extract valuable memories in JSON format. The extracted memories include subject, keywords, applies_to scope, and content fields. This allows the system to automatically capture insights from coding sessions for reuse in future sessions.
