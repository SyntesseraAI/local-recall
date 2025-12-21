---
id: 4e1eab42-9d02-4aee-b17a-cf04debd91c4
subject: >-
  Thinking extractor needed to parse streaming transcripts by message ID
  grouping
keywords:
  - thinking-extractor
  - message-id
  - streaming
  - jsonl
  - parsing
  - transcript
applies_to: 'file:src/core/thinking-extractor.ts'
occurred_at: '2025-12-21T19:14:44.781Z'
content_hash: 0c9c27799314ad02
---
Claude Code streams assistant responses as separate JSONL lines where each content block (thinking, text, tool_use) has its own line but shares the same `message.id`. The thinking extractor was failing because it expected thinking and text content in the same array.

Fixed by modifying `parseTranscriptForThinking` to:
1. Parse all JSONL lines into an array
2. Create a Map grouping entries by `message.id`
3. For each message, collect thinking blocks and text content separately
4. Only create thinking memories when BOTH thinking and text exist for the same message

This allows proper pairing of thoughts with their corresponding outputs across multiple JSONL lines.
