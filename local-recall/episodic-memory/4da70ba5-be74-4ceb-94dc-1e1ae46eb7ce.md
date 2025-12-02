---
id: 4da70ba5-be74-4ceb-94dc-1e1ae46eb7ce
subject: Vector store uses SQLite with sqlite-vec extension for semantic search
keywords:
  - vector store
  - sqlite
  - embeddings
  - fastembed
  - bge-small-en-v1.5
  - semantic search
applies_to: 'area:vector-store'
occurred_at: '2025-12-02T11:49:07.288Z'
content_hash: 179cab769d186733
---
The vector store in `src/core/vector-store.ts` uses better-sqlite3 with the sqlite-vec extension for semantic similarity search. Embeddings are generated using fastembed with the BGE-small-en-v1.5 model (~133MB). The model is cached in `local_cache/` and auto-downloads on first use. Initial startup may take 30-60 seconds for first-time model download.
