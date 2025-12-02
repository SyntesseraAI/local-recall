---
id: 3ed0cb07-a05f-43ed-aee2-8e8dd2dec20d
subject: >-
  Memory extraction prompts are centralized in memory-extraction.ts for
  consistency
keywords:
  - prompts
  - memory-extraction
  - prompt-engineering
  - haiku-instructions
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:24:27.640Z'
content_hash: 65482542df72be16
---
Memory extraction prompts are stored separately in `src/prompts/memory-extraction.ts` to maintain consistency and allow easy updates to the extraction logic without modifying the core extractor. This separation of concerns makes it easier to refine memory extraction over time.
