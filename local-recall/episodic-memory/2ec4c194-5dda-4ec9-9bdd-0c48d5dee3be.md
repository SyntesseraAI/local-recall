---
id: 2ec4c194-5dda-4ec9-9bdd-0c48d5dee3be
subject: >-
  Transcript structure uses events with [User], [Assistant], and [Tool] markers
  for parsing
keywords:
  - transcript
  - format
  - parsing
  - events
  - user prompt
  - assistant response
  - tool invocation
applies_to: 'file:src/utils/transcript.ts'
occurred_at: '2025-12-01T16:01:16.389Z'
content_hash: df72b99cc8778042
---
Claude Code transcripts are structured as events marked with `[User]`, `[Assistant]`, and `[Tool: ToolName]` prefixes. The transcript parser should extract these events to understand session flow. Tool results are indicated by `[Result: OK/ERROR]` markers. This structure is consistent across all Claude Code sessions and is used for extracting actionable memories.
