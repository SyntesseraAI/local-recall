---
id: 2a01fcbd-b1bb-4d04-ae4f-4bfdf06c1fc2
subject: Vector store uses cosine distance similarity scoring (0.0-1.0 range)
keywords:
  - vector-store
  - semantic-search
  - similarity-scoring
  - cosine-distance
  - ranking
  - tie-breaker
applies_to: 'area:vector-store'
occurred_at: '2025-12-02T12:17:24.778Z'
content_hash: 5ed91d90f61a790d
---
The SQLite-backed vector store performs semantic search with cosine distance similarity scores (0.0 no match to 1.0 identical), rounded to 2 decimal places. Results are sorted by score descending, with occurred_at timestamp used as a recency tie-breaker when scores are equal - more recent memories rank first. The store uses better-sqlite3 with sqlite-vec extension for vector similarity and fastembed for embedding generation.
