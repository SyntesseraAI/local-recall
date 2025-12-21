---
id: c3c32fbd-dfcc-476d-a6b9-fbee00521fc3
subject: >-
  Vector store search results are sorted by distance (similarity), with recency
  as secondary tie-breaker
keywords:
  - vector store
  - search
  - similarity
  - scoring
  - occurred_at
  - recency
applies_to: 'file:src/core/vector-store.ts'
occurred_at: '2025-12-21T18:25:49.095Z'
content_hash: fe11651e98e452ca
---
In `src/core/vector-store.ts:200-270`, search results are primarily sorted by distance/similarity (lower distance = higher similarity), not by `occurred_at`. Similarity scores are calculated as `1 - (distance / 2)` and rounded to 2 decimal places (e.g., 0.65). When multiple results have equal rounded scores, they are sorted by `occurred_at` descending (newest first) as a tie-breaker for recency.
