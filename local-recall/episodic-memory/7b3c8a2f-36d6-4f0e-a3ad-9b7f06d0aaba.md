---
id: 7b3c8a2f-36d6-4f0e-a3ad-9b7f06d0aaba
subject: Memory deduplication strategy in Local Recall
keywords:
  - deduplication
  - duplicate-detection
  - occurred-at
  - content-hash
  - memory-manager
applies_to: 'file:src/core/memory.ts'
occurred_at: '2025-12-01T16:20:47.415Z'
content_hash: 127edfe8771dc567
---
# Memory Deduplication

Local Recall uses a two-field composite key for detecting duplicate memories:

1. **occurred_at**: ISO-8601 timestamp of when the event originally occurred
2. **content_hash**: SHA-256 hash prefix (first 16 characters) of the memory content

## Deduplication Logic

Before creating a new memory, the system checks if a memory with the same `occurred_at` and `content_hash` already exists. If it does, the existing memory is returned instead of creating a duplicate.

## Implementation

The `findDuplicate(occurredAt, contentHash)` function in `src/core/memory.ts` handles this check.

## Why This Approach

This approach allows the same event to be discovered and documented multiple times (e.g., by different AI assistants or in different sessions) without creating duplicate memories, while still being flexible enough to capture the same event with slightly different wording as a new memory if the content hash differs significantly.
