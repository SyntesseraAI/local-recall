---
id: ea5aa19d-a7bc-4959-a9de-10e1fad20d3a
subject: >-
  Memory extraction improvements: transcript condensing, deduplication, and
  search ranking
keywords:
  - memory-extraction
  - transcript-condensing
  - deduplication
  - search-ranking
  - episodic-memory
  - semantic-search
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-02T06:08:03.267Z'
content_hash: 9b3b2667e8880b99
---
# Memory Extraction Enhancements

## Transcript Condensing

Recent changes implement transcript condensing to improve memory extraction quality:
- Tool results are excluded from condensed transcripts
- Only user messages and assistant responses are included
- This reduces token usage and focuses extraction on substantive interactions

## Deduplication Strategy

Memories use two-part deduplication:
1. `occurred_at`: Timestamp of when the original event/discovery occurred
2. `content_hash`: SHA-256 hash prefix (16 chars) of memory content

The `findDuplicate()` function checks both fields to prevent creating duplicate memories from similar sessions.

## Search Ranking

Search results are sorted by `occurred_at` (most recent first), helping prioritize recent memories.

## Recent Changes

- Removed `created_at` field (not needed with `occurred_at`)
- Transcript condensing implemented for better extraction
- Search results now properly sorted by occurrence time
