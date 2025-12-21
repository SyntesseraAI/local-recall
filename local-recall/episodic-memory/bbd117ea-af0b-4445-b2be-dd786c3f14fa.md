---
id: bbd117ea-af0b-4445-b2be-dd786c3f14fa
subject: Transcript sync now filters synthetic transcripts before copying
keywords:
  - transcript-collector
  - synthetic
  - sync
  - optimization
  - filtering
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-21T18:30:22.170Z'
content_hash: 15be961334e4fe10
---
The `syncTranscripts()` method in transcript-collector.ts was updated to check if source transcripts are synthetic BEFORE copying them from Claude's cache. Previously, synthetic transcripts could be copied and then deleted during cleanup, causing unnecessary I/O. Now the flow is:

1. `cleanupTranscripts()` runs first to remove any previously-copied synthetic files
2. For each new/modified transcript, checks `isSyntheticFile(transcript.sourcePath)` before copying
3. Skips synthetic files with a debug log

This optimization prevents unnecessary file I/O and keeps the transcript sync process cleaner.
