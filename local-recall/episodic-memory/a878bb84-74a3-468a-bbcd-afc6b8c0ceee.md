---
id: a878bb84-74a3-468a-bbcd-afc6b8c0ceee
subject: Similarity threshold changed to 50% for memory retrieval
keywords:
  - similarity-threshold
  - memory-retrieval
  - configuration
  - '0.5'
applies_to: global
occurred_at: '2025-12-21T18:32:04.567Z'
content_hash: d2f738106477d91b
---
Default similarity threshold for both episodic and thinking memories lowered from 80% (0.8) to 50% (0.5). This is configured in `src/core/types.ts` with environment variables `LOCAL_RECALL_EPISODIC_MIN_SIMILARITY` and `LOCAL_RECALL_THINKING_MIN_SIMILARITY`. The hook uses `if (result.score < minSimilarity) continue` to filter results, so a 0.5 threshold includes memories scoring 50% or higher.
