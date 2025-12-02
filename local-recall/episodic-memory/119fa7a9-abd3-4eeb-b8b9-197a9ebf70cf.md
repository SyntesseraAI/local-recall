---
id: 119fa7a9-abd3-4eeb-b8b9-197a9ebf70cf
subject: Local Recall memory file deduplication uses occurred_at and content_hash
keywords:
  - deduplication
  - memory-files
  - content-hash
  - occurred-at
  - idempotent
  - duplicate-detection
applies_to: 'area:memory-management'
occurred_at: '2025-12-02T12:33:41.672Z'
content_hash: 854e32e967fcd351
---
# Memory Deduplication Strategy

Local Recall implements idempotent memory creation to prevent duplicates:

## Deduplication Process

1. **Two-part identification**: Each memory has:
   - `occurred_at`: ISO-8601 timestamp of when the event occurred
   - `content_hash`: SHA-256 hash prefix (16 chars) of the memory content

2. **Duplicate detection**: `findDuplicate(occurredAt, contentHash)` checks if a memory with the same `occurred_at` and `content_hash` already exists

3. **Idempotent creation**: `createMemory()` returns the existing memory if a duplicate is found, rather than creating a new one

## Why This Works

- `occurred_at` groups memories from the same event or time period
- `content_hash` ensures the same content isn't duplicated
- Together they provide a reliable way to detect when the same memory has already been created
- This is especially useful for transcript processing where the same transcript might be processed multiple times
