---
id: bcb7823a-d433-41cb-8ae6-ffb0ecd46e8c
subject: >-
  Thinking extractor fix: Claude Code streams thinking and text as separate
  JSONL lines
keywords:
  - thinking
  - transcript
  - jsonl
  - streaming
  - message-id
  - grouping
applies_to: 'file:src/core/thinking-extractor.ts'
occurred_at: '2025-12-21T18:16:42.322Z'
content_hash: 23e48fae68cfdac4
---
Claude Code streams assistant responses as separate JSONL lines - each content block gets its own line. The thinking block and text output are on different lines but share the same `message.id`. The thinking extractor must group entries by message ID using a Map to aggregate thinking and text content from the same message, not expect them in the same content array.
