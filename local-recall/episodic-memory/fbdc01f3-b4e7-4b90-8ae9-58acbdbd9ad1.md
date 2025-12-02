---
id: fbdc01f3-b4e7-4b90-8ae9-58acbdbd9ad1
subject: >-
  Vector store uses sqlite-vec extension with fastembed and BGE-small-en-v1.5
  model
keywords:
  - vector-store
  - sqlite
  - embeddings
  - fastembed
  - bge-small
  - semantic-search
applies_to: 'area:core'
occurred_at: '2025-12-02T16:54:49.897Z'
content_hash: 07e2c9fff1196236
---
Local Recall uses a SQLite-backed vector store with the sqlite-vec extension for semantic search. Embeddings are generated using fastembed with the BGE-small-en-v1.5 model (~133MB). The model is automatically downloaded to `local_cache/` on first use (takes 30-60 seconds initially, then cached). Search results use cosine distance similarity scoring (0.0-1.0 range, rounded to 2 decimals), with recency as a tie-breaker when scores are equal.
