---
id: e258b8ce-c5a4-4fea-9fd0-ae016ba8b76e
subject: Synthetic transcript detection used in transcript collection workflow
keywords:
  - isSyntheticFile
  - transcript-collector
  - synthetic detection
  - source path checking
applies_to: global
occurred_at: '2025-12-21T19:22:06.032Z'
content_hash: 03a3851815b94f45
---
The codebase has a `isSyntheticFile()` function that can identify synthetic transcripts from their source path. This function is used in `syncTranscripts()` (line ~270) to determine whether to copy a transcript from Claude's cache before the actual copy operation occurs.

This is a key filtering mechanism to avoid processing synthetic/temporary transcripts in the memory extraction pipeline.
