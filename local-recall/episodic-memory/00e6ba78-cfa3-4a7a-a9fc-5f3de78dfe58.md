---
id: 00e6ba78-cfa3-4a7a-a9fc-5f3de78dfe58
subject: >-
  Memory extraction uses Claude API with specific prompt engineering for robust
  extraction
keywords:
  - memory-extraction
  - claude-api
  - prompt-engineering
  - transcript-processing
applies_to: global
occurred_at: '2025-12-01T22:08:49.961Z'
content_hash: 62c60b0cb3616ab0
---
The memory extraction process uses the Claude API (via `claude -p` command) with a carefully engineered prompt. The extraction prompt is defined in `src/prompts/memory-extraction.ts` and handles converting session transcripts into structured memories. The `memory-extractor.ts` module processes transcripts asynchronously and manages the extraction workflow.
