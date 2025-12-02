---
id: ff02e0ba-f72f-4f9c-959d-afc01e54af4c
subject: Vector similarity search uses cosine distance with recency tie-breaker
keywords:
  - search
  - scoring
  - cosine-distance
  - ranking
  - recency
applies_to: 'area:search'
occurred_at: '2025-12-02T21:55:32.389Z'
content_hash: 3235152f58062381
---
Search results use cosine distance similarity scoring:
- Score range: 0.0 (no match) to 1.0 (identical)
- Scores are rounded to 2 decimal places
- Results sorted by score descending
- When scores are equal, more recent memories (by `occurred_at`) are ranked first
