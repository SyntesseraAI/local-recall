---
id: d1a7dcbe-1448-451d-bccb-61c0fbb6a52a
subject: Transcript condensing implementation patterns for memory extraction
keywords:
  - transcript
  - condensing
  - memory-extraction
  - compression
  - claude-api
  - token-efficiency
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:14:21.510Z'
content_hash: ec2b02eaf6a30848
---
# Transcript Condensing for Memory Extraction

When processing Claude transcripts for memory extraction, the raw transcripts should be condensed before sending to Claude for analysis to:

1. Reduce token usage and API costs
2. Improve processing speed
3. Focus Claude's attention on semantically important content
4. Remove verbose formatting and redundant information

## Condensing Strategy

Transcripts should be condensed into an event-based format:
- `[User]` - User requests/questions
- `[Assistant]` - Claude responses/explanations
- `[Tool: Name]` - Tool invocations (Read, Edit, Bash, etc.)
- `[Result: OK/ERROR]` - Tool outcomes

This reduces raw transcript size while preserving the essential semantic information needed for memory extraction.

## Implementation Location

This condensing logic should be implemented in the transcript-collector component before passing transcripts to Claude for memory extraction.
