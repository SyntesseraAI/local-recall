---
id: d5eaabf3-7cdd-48a1-83a7-ec4ff43f0aa4
subject: >-
  Transcript messages now include optional thinking field for extended thinking
  tracking
keywords:
  - transcript
  - thinking
  - extended-thinking
  - message-type
  - types
applies_to: 'file:src/core/types.ts'
occurred_at: '2025-12-01T16:09:32.721Z'
content_hash: 9229ea8983e7f4d3
---
Added optional `thinking?: string` field to `TranscriptMessage` type to capture Claude's extended thinking. This allows the transcript collector to separate thinking from the final answer text.
