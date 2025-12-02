---
id: 51df18ff-f234-4b8a-b2e8-6fdcb73ebd6f
subject: Transcript condensing implemented in memory-extractor.ts to reduce token usage
keywords:
  - transcript
  - condensing
  - memory-extractor
  - tokens
  - optimization
  - claude-api
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T06:27:16.443Z'
content_hash: 5b82360fe10b047d
---
# Transcript Condensing for Memory Extraction

The memory extraction process has been enhanced with transcript condensing to reduce API token usage.

## Implementation Details

- Transcript condensing is handled by `memory-extractor.ts`
- Reduces the amount of data sent to Claude API for memory extraction
- Improves performance when processing large transcripts
- Helps stay within token budget constraints

## Context

This feature was implemented as part of refactoring the memory collection system to optimize API usage while maintaining memory quality.
