---
id: d120f441-0bda-4cd1-bde0-cca92fefea78
subject: >-
  Memory extraction uses transcript condensing to improve efficiency and reduce
  token usage
keywords:
  - memory extraction
  - transcript condensing
  - efficiency
  - token usage
  - claude haiku
applies_to: global
occurred_at: '2025-12-01T16:14:49.018Z'
content_hash: b381640ca3280310
---
The memory extraction process in `src/core/memory-extractor.ts` uses transcript condensing to reduce the size of transcripts before sending them to Claude Haiku for memory extraction. This improves efficiency and reduces token usage while maintaining important context for memory generation. The `extractMemoriesFromTranscript` function calls `condenseTranscript` before passing the transcript to the memory extraction prompt.
