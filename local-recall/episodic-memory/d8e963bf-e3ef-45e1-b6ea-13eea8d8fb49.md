---
id: d8e963bf-e3ef-45e1-b6ea-13eea8d8fb49
subject: >-
  Memory extraction uses Claude Haiku with structured prompts to convert
  transcripts into memories
keywords:
  - memory extraction
  - claude haiku
  - transcript
  - prompts
  - memory-extractor
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-02T01:41:51.424Z'
content_hash: fcbd520587de6ecc
---
The memory extraction system in `src/core/memory-extractor.ts` uses Claude Haiku to intelligently convert session transcripts into structured memories. The extraction process:

1. Reads the session transcript
2. Sends it to Claude Haiku with a system prompt from `src/prompts/memory-extraction.ts`
3. Claude identifies and extracts valuable memories
4. Memories are deduplicated using `occurredAt` timestamp and `contentHash`
5. Extracted memories are automatically created via the memory manager

The prompts are centralized in `src/prompts/memory-extraction.ts` for easy maintenance and iteration.
