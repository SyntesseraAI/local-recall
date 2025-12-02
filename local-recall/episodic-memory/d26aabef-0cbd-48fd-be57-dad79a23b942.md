---
id: d26aabef-0cbd-48fd-be57-dad79a23b942
subject: Vector store uses SQLite with sqlite-vec extension for semantic search
keywords:
  - vector-store
  - sqlite
  - embeddings
  - semantic-search
  - cosine-distance
applies_to: 'area:search'
occurred_at: '2025-12-02T16:57:59.577Z'
content_hash: 54915c2ed2815bd1
---
The vector store in src/core/vector-store.ts uses better-sqlite3 with the sqlite-vec extension for similarity search. It uses fastembed with BGE-small-en-v1.5 model (~133MB) for generating embeddings. Search results are ranked by cosine distance (0.0-1.0 score, rounded to 2 decimals) with recency as tie-breaker when scores are equal.
