---
id: 614f5cc6-cedb-4d5b-95e7-5f2fe2faa5d3
subject: Memory file deduplication strategy using occurred_at and content_hash
keywords:
  - deduplication
  - content-hash
  - occurred-at
  - memory-creation
applies_to: 'file:src/core/memory.ts'
occurred_at: '2025-12-02T11:40:53.599Z'
content_hash: d11623a780c19dae
---
Memory files use two fields for deduplication to prevent storing duplicate memories:

- `occurred_at` - ISO-8601 timestamp of when the event occurred
- `content_hash` - SHA-256 prefix (16 chars) of the memory content

The `findDuplicate(occurredAt, contentHash)` function checks if a memory with the same occurred_at and content_hash already exists. This is idempotent - calling `createMemory()` with the same data returns the existing memory instead of creating a duplicate.

This design allows transcripts to be re-processed without accumulating duplicate memories.
