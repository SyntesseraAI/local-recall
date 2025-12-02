---
id: b7bf6ead-bde6-44de-ac3c-8546d2b883a2
subject: >-
  Memory extraction prompt is centralized in memory-extraction.ts for consistent
  memory generation
keywords:
  - prompt engineering
  - memory extraction
  - system prompt
  - centralized configuration
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:24:11.255Z'
content_hash: 85fa2530a716b723
---
The memory extraction prompt is stored separately in src/prompts/memory-extraction.ts to keep the prompt logic decoupled from the extractor implementation. This allows for easy updates to extraction criteria without modifying the core extractor code. The prompt defines guidelines for what constitutes valuable memories and the expected output format.
