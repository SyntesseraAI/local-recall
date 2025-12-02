---
id: 9cef7cfe-bdbf-4c7d-97dd-488e406cbfb1
subject: >-
  Memory extraction uses Claude Haiku for prompt-based keyword and memory
  generation
keywords:
  - memory extraction
  - claude haiku
  - keyword generation
  - architecture
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T16:31:26.111Z'
content_hash: 478f2f53a3aaeae1
---
The memory extraction system uses Claude Haiku model via `claude -p` command to:
1. Generate keywords from user prompts and transcripts
2. Extract structured memories from transcript content

This is implemented in `src/core/memory-extractor.ts` which invokes the Claude API to process transcript data and generate memory objects with subject, keywords, applies_to scope, and content fields.
