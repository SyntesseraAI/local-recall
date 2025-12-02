---
id: 9f2bb8cb-b693-4bc2-a4df-e3b07d2ac6e4
subject: >-
  memory-extractor.ts contains logic for parsing and analyzing Claude Code
  transcripts
keywords:
  - memory-extractor
  - transcript-parsing
  - analysis
  - core-module
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T22:12:48.575Z'
content_hash: 21436e0fa0b4b246
---
The `src/core/memory-extractor.ts` file (478 lines) is a core module responsible for analyzing Claude Code session transcripts. It contains the logic needed to process condensed transcript formats with events marked as `[User]`, `[Assistant]`, and `[Tool: Name]`, along with their corresponding results. This module is critical for the automated memory extraction pipeline that creates valuable memories from past coding sessions.
