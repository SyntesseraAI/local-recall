---
id: f3e2deb0-eca9-4787-b1ef-3ecd6d0cb835
subject: >-
  onnxruntime-node native mutex errors require file-based locking for concurrent
  access
keywords:
  - mutex
  - onnxruntime-node
  - fastembed
  - concurrency
  - native-bindings
  - file-lock
applies_to: global
occurred_at: '2025-12-03T11:22:14.365Z'
content_hash: 88bef6fb4ee42892
---
The project migrated from SQLite+sqlite-vec to Orama, but still experiences mutex errors because `onnxruntime-node` (a dependency of `fastembed` used for embeddings) has native bindings that cause the same mutex issues when loaded by multiple concurrent hook processes.

**Root Cause**: When multiple hook processes load `fastembed` → `onnxruntime-node` concurrently, the native module's internal mutex fails with "mutex lock failed: Invalid argument".

**Solution Implemented**: File-based locking using `proper-lockfile` package to serialize access to embedding operations.

**Implementation Details**:
- Lock file location: `/tmp/local-recall-embedding.lock`
- Both initialization (`EmbeddingService.initialize()`) and embedding operations (`embed()`) are locked
- Retries: 10 with exponential backoff (100ms - 2s)
- Stale lock timeout: 30 seconds
- Logs: "Acquired embedding lock" / "Released embedding lock" messages

The daemon architecture removal during Orama migration exposed this issue - the daemon had previously serialized all native module access.
