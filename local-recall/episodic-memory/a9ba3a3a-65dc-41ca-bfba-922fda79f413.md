---
id: a9ba3a3a-65dc-41ca-bfba-922fda79f413
subject: Memory extraction prompts are centralized in src/prompts/memory-extraction.ts
keywords:
  - prompts
  - memory extraction
  - system prompt
  - centralized
  - memory-extraction.ts
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T15:54:16.194Z'
content_hash: 603abca5dafaf3d4
---
Memory extraction prompts are kept separate and centralized in `src/prompts/memory-extraction.ts`. This includes both the system prompt (which defines how Claude should extract memories) and the user prompt template (which wraps the transcript). This separation keeps the memory extractor logic clean and makes it easier to iterate on extraction quality without modifying the core extraction code.
