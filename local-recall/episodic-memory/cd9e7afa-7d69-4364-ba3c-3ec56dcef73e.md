---
id: cd9e7afa-7d69-4364-ba3c-3ec56dcef73e
subject: Local Recall is a persistent memory system with SQLite vector embeddings
keywords:
  - memory system
  - vector embeddings
  - sqlite
  - semantic search
  - persistence
applies_to: global
occurred_at: '2025-12-02T12:20:35.884Z'
content_hash: 39ffd909fd0542f2
---
Local Recall provides a persistent memory layer using SQLite with vector embeddings for semantic search. Memories are stored as markdown files in `local-recall/episodic-memory/` directory and are version-controlled in git. The vector store uses `better-sqlite3` with `sqlite-vec` extension and `fastembed` for embeddings with the BGE-small-en-v1.5 model (~133MB).
