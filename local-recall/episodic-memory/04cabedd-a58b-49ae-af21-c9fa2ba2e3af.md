---
id: 04cabedd-a58b-49ae-af21-c9fa2ba2e3af
subject: Memory deduplication strategy using content hash and timestamp
keywords:
  - memory
  - deduplication
  - duplicate-detection
  - content-hash
  - occurred-at
  - idempotent
applies_to: global
occurred_at: '2025-12-02T06:31:39.307Z'
content_hash: a45cf0d6d1cfcb36
---
# Memory Deduplication

Memories are deduplicated using a combination of:

1. **Timestamp** (`occurred_at`): ISO-8601 timestamp of when the original event occurred
2. **Content Hash** (`content_hash`): SHA-256 hash prefix (16 chars) of the memory content

## Idempotency

- `createMemory()` returns existing memory if exact duplicate is found
- Duplicate check: `findDuplicate(occurredAt, contentHash)`
- This prevents duplicate memory creation when the same event is processed multiple times

## Use Cases

- When transcript is re-processed (transcript collector runs again)
- When memory extraction happens multiple times for same session
- Ensures memories remain unique even with repeated ingestion

## Implementation

Referenced in `src/core/memory.ts` for CRUD operations on memory files.
