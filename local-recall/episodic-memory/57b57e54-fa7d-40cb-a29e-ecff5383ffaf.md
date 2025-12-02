---
id: 57b57e54-fa7d-40cb-a29e-ecff5383ffaf
subject: Memory deduplication uses occurred_at timestamp and content_hash
keywords:
  - deduplication
  - occurred_at
  - content_hash
  - duplicate-detection
applies_to: global
occurred_at: '2025-12-02T12:02:18.047Z'
content_hash: 859576b06a726d7f
---
Memory deduplication is handled through:
- `occurred_at`: ISO-8601 timestamp of original event (for chronological deduplication)
- `content_hash`: SHA-256 hash prefix (16 chars) of memory content

The `findDuplicate(occurredAt, contentHash)` method in MemoryManager checks for existing duplicates before creating new memories. This prevents duplicate memories when:
- The same memory is discovered multiple times
- Transcripts are re-processed
- Same event is documented by different sessions
