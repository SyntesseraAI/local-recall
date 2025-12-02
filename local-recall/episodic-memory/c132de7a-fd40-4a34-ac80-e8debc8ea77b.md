---
id: c132de7a-fd40-4a34-ac80-e8debc8ea77b
subject: >-
  Transcript condensing is needed to extract memories effectively from full
  JSONL files
keywords:
  - transcript
  - condensing
  - memory-extraction
  - efficiency
  - Claude-Haiku
  - token-usage
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:31:36.045Z'
content_hash: d09ed61f5a197057
---
## Transcript Condensing for Memory Extraction

When extracting memories from Claude Code transcripts, full JSONL files are too large for efficient processing:

- Full transcript files can have hundreds of turns with verbose content
- Processing raw transcripts directly wastes tokens and context
- Solution: Implement transcript condensing that extracts key events and summaries
- Condensed format should preserve: user requests, assistant responses, tool invocations, and results
- This allows Claude Haiku to efficiently analyze transcripts and extract memories
- The condensing process itself can be done with Claude Haiku to reduce token usage
