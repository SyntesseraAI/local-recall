---
id: b283ff11-fb98-4caa-adb9-abbea88b55a2
subject: Thinking extractor groups messages by ID from separate JSONL lines
keywords:
  - thinking-extractor
  - transcript-parsing
  - jsonl-format
  - message-grouping
  - streaming
applies_to: 'file:src/core/thinking-extractor.ts'
occurred_at: '2025-12-21T18:17:33.752Z'
content_hash: 00047c08302feccd
---
Claude Code streams assistant responses as separate JSONL lines, each with its own content block (thinking, text, tool_use) but sharing the same `message.id`. The thinking extractor must group entries by message.id using a Map to aggregate thinking and text content from multiple lines before processing them together.

Example: thinking block on line 3 and text block on line 4 both have `id: msg_01TriDi1rq2PacC13JUYuvB4`, requiring them to be grouped during parsing.
