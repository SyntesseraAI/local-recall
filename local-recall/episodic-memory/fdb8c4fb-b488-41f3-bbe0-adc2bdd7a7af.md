---
id: fdb8c4fb-b488-41f3-bbe0-adc2bdd7a7af
subject: >-
  Memory extractor uses Claude Haiku with custom prompt for extracting memories
  from transcripts
keywords:
  - memory-extractor
  - claude-haiku
  - transcript-processing
  - memory-extraction
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T15:54:26.519Z'
content_hash: aad1fcdd9c6e9215
---
The memory extractor module uses Claude Haiku (via `claude -p` command) to process transcripts and extract structured memories. It references a prompt file at `src/prompts/memory-extraction.ts` for the extraction logic. The extractor is used to automatically parse transcripts and create memories without manual intervention.
