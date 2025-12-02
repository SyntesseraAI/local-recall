---
id: 5fdc1c9a-9d7f-40d1-b7d5-3f0bfdfeb172
subject: >-
  Memory extractor uses Claude Haiku to extract memories from transcripts with
  specific prompt structure
keywords:
  - memory-extractor
  - claude-haiku
  - transcript-processing
  - prompt-engineering
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T02:23:02.303Z'
content_hash: 03a212134ce113a5
---
The memory extractor in memory-extractor.ts uses Claude Haiku (via `claude -p` command) to process transcripts and extract memories. It uses a specialized prompt from src/prompts/memory-extraction.ts that defines the exact format and instructions for extracting structured memory objects. The extracted memories follow the standard memory format with id, subject, keywords, applies_to scope, occurred_at timestamp, and content_hash fields.
