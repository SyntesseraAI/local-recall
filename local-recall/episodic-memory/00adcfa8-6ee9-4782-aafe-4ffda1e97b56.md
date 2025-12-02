---
id: 00adcfa8-6ee9-4782-aafe-4ffda1e97b56
subject: >-
  Memory extraction prompt defines what constitutes valuable memories to extract
  from transcripts
keywords:
  - memory extraction prompt
  - extraction guidelines
  - memory-extraction.ts
  - what to extract
  - memory criteria
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:29:26.672Z'
content_hash: 50fc02f532d6184d
---
The memory extraction prompt (memory-extraction.ts) contains detailed guidelines for what should and shouldn't be extracted from transcripts. It instructs Claude to focus on architectural decisions, bug fixes, code patterns, configuration quirks, and user preferences. It explicitly excludes generic programming knowledge, temporary debugging steps, and sensitive data. The prompt emphasizes being specific (with file paths and function names), concise (one concept per memory), and actionable (helping future assistants avoid mistakes).
