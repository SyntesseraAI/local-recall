---
id: ed44cea4-98ee-4088-af52-f9bc77da7cfa
subject: 'ONNX runtime causes mutex errors in concurrent hook processes, not sqlite-vec'
keywords:
  - mutex
  - onnx
  - fastembed
  - concurrency
  - embedding
  - hook
  - error
applies_to: global
occurred_at: '2025-12-21T18:27:27.411Z'
content_hash: 40102432e1b4bc43
---
The mutex errors that occur when running multiple concurrent hook processes are caused by ONNX runtime (used by fastembed), not sqlite-vec. The Orama migration fixed SQLite issues, but ONNX has internal mutex conflicts when multiple processes load the embedding model concurrently. The `proper-lockfile` file-based locking doesn't prevent ONNX's system-level mutex issues. This affects `user-prompt-submit.ts` which directly instantiates `SearchEngine`/`ThinkingSearchEngine` that load the embedding model.
