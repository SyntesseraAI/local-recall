---
id: e4ded9fb-ebdb-4c4c-85da-9c2aafd24a55
subject: Memory extraction prompts are centralized in dedicated prompt file
keywords:
  - prompts
  - memory-extraction
  - system-prompt
  - extraction-logic
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T22:02:30.494Z'
content_hash: 9028cd69fbb6ca2f
---
Memory extraction logic uses a separate prompt file at `src/prompts/memory-extraction.ts` that contains the system prompt and instructions for Claude to analyze transcripts and identify valuable memories. This centralizes the extraction instructions and makes them easy to maintain and update.
