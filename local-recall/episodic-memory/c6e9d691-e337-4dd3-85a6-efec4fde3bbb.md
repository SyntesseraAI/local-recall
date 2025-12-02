---
id: c6e9d691-e337-4dd3-85a6-efec4fde3bbb
subject: Memory extraction prompts are stored in dedicated prompt file
keywords:
  - memory-extraction
  - prompts
  - prompt-engineering
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T23:04:48.778Z'
content_hash: c1eb4ae90d5dbb49
---
Memory extraction prompts are centralized in `src/prompts/memory-extraction.ts`. This separation of concerns allows for easier maintenance and updates to the prompting strategy for memory generation without modifying the core extraction logic in `memory-extractor.ts`.
