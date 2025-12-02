---
id: 578bfa13-a6f4-47de-a0bd-7cbe68ccc5f8
subject: >-
  Memory extraction prompts are centralized in memory-extraction.ts for
  consistency
keywords:
  - memory extraction
  - prompts
  - centralized
  - consistency
  - memory-extraction.ts
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:07:13.012Z'
content_hash: b5eabbc877655d1e
---
The system prompts and user prompts for memory extraction are centralized in `src/prompts/memory-extraction.ts`. This allows for consistent prompting across different parts of the system and makes it easy to iterate on prompt wording without modifying the extraction logic.
