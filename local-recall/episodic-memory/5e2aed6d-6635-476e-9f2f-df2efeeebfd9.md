---
id: 5e2aed6d-6635-476e-9f2f-df2efeeebfd9
subject: >-
  Memories use duplicate prevention via content hash and timestamp, but no
  compaction/pruning exists
keywords:
  - deduplication
  - duplicate prevention
  - content-hash
  - occurred-at
  - memory management
  - no compaction
applies_to: global
occurred_at: '2025-12-21T18:21:53.570Z'
content_hash: 8ff36a0fe282cba8
---
Memory management in Local Recall includes **duplicate prevention** but not compaction:

**Deduplication (Implemented):**
- `MemoryManager.findDuplicate()` prevents duplicate memory creation
- Checks if memory with same `occurred_at` timestamp AND `content_hash` already exists
- If duplicate found, returns existing memory instead of creating new one
- Helps prevent redundant memories from being stored

**Compaction/Pruning (Does NOT exist):**
- No automatic cleanup or consolidation of memories
- No oldest-memory deletion based on `maxMemories` limit
- `maxMemories` config option exists but is not enforced
- Memories accumulate indefinitely once created
- No merging or summarization of related memories

This means memory directory can grow unbounded unless manually managed.
