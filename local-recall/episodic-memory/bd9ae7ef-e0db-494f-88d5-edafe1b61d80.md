---
id: bd9ae7ef-e0db-494f-88d5-edafe1b61d80
subject: Recursive transcript processing for episode memory extraction
keywords:
  - transcript-processing
  - recursion
  - memory-extraction
  - conversation-turns
  - episode-memory
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-02T07:19:18.638Z'
content_hash: f46191b1d9fe4359
---
# Recursive Transcript Processing

When extracting episode memories from transcripts, the processing needs to handle conversation structure effectively.

## Approach

A recursive solution works well for processing transcripts:
- Process transcript turns in chronological order
- For each turn, extract context and identify actionable memories
- Handle special cases like tool invocations and their results
- Build memories that capture meaningful interactions

## Key Considerations

- Transcripts contain mixed content: user messages, assistant responses, tool calls, and results
- Episode memories should capture significant work completed during a session
- The extraction should be deterministic to avoid duplicate memories
- Consider batching related turns together for context
