---
id: d67edbb3-a1eb-4efe-a613-d87aec5af821
subject: Similarity scores rounded to 2 decimal places with recency as tie-breaker
keywords:
  - scoring
  - similarity
  - distance
  - rounding
  - ranking
  - occurred_at
applies_to: 'file:src/core/vector-store.ts'
occurred_at: '2025-12-21T18:24:38.922Z'
content_hash: 700cf4333c369a71
---
Vector search results use **cosine distance** similarity scoring with the following behavior:

1. **Score Range**: 0.0 (no match) to 1.0 (identical)
2. **Rounding**: All scores are rounded to 2 decimal places using `Math.round((1 - distance / 2) * 100) / 100`
   - Example: 0.6524... becomes 0.65
3. **Recency Tie-breaker**: When multiple results have equal similarity scores, they are sorted by `occurred_at` descending (newest first)
4. **Sort Order**: Results are first sorted by distance, then by `occurred_at` for ties

This ensures consistent, readable scores and prioritizes more recent memories when similarity is equivalent.
