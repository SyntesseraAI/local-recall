---
id: 6ac7559e-aded-45bd-97ee-c8bb00fffb43
subject: session-start hook is safe from ONNX issues because it only uses MemoryManager
keywords:
  - session-start
  - hook
  - memory-manager
  - safe
  - no-embeddings
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-21T19:45:32.573Z'
content_hash: 5a5f4cd3de8cdab4
---
The session-start hook is not affected by mutex errors because it only uses MemoryManager (file-based operations, no embeddings). The mutex issue is specific to user-prompt-submit hook which directly instantiates SearchEngine/ThinkingSearchEngine that load the embedding model.
