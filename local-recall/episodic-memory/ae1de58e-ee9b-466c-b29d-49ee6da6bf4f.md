---
id: ae1de58e-ee9b-466c-b29d-49ee6da6bf4f
subject: >-
  Transcript entries must have type field to distinguish between user prompts,
  assistant responses, and tool calls
keywords:
  - transcript
  - entries
  - type
  - event
  - user
  - assistant
  - tool
  - classification
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-01T16:30:37.081Z'
content_hash: 03567c84c6229799
---
Each transcript entry has a `type` field that indicates what kind of event it is:
- `"user"`: User message or prompt
- `"assistant"`: Claude's response
- `"tool"`: Tool invocation
- Other potential types for future events

This type field is critical for the memory extraction pipeline because:
1. It allows filtering entries (e.g., only process user prompts and assistant responses)
2. It helps identify which tools were used and their outputs
3. It enables the system to understand the flow and context of the session

When building the condensed transcript for memory extraction, the type field should be preserved to maintain context about what happened in the session.
