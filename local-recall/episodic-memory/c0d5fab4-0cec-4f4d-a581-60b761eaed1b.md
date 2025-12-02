---
id: c0d5fab4-0cec-4f4d-a581-60b761eaed1b
subject: Memory extraction uses Claude Haiku via claude -p for transcript analysis
keywords:
  - memory-extractor
  - claude-haiku
  - transcript
  - extraction
  - process
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:34:49.693Z'
content_hash: 9465d9811907115b
---
The memory extraction system uses the `claude -p` command to invoke Claude Haiku for analyzing transcripts. The `MemoryExtractor` class in `src/core/memory-extractor.ts` spawns a child process that sends transcript content to Claude and receives memory extraction results. This allows the system to leverage Claude's reasoning capabilities for identifying valuable memories from session transcripts.
