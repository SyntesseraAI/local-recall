---
id: 263e71d1-202b-4ced-a84c-bfce06dd0ccc
subject: >-
  Project uses fastembed library with BGE-small-en-v1.5 model (~133MB) for
  semantic search capabilities
keywords:
  - embedding
  - semantic-search
  - fastembed
  - bge-small
  - ml-model
applies_to: global
occurred_at: '2025-12-02T08:02:29.715Z'
content_hash: a4373dc083a1598b
---
Local Recall uses the `fastembed` library with the BGE-small-en-v1.5 embedding model for semantic search functionality. The model is approximately 133MB and is automatically downloaded to `local_cache/` on first use (30-60 seconds on initial startup). Subsequent runs load the cached model.

**Troubleshooting:** If you see a tokenizer file not found error, the cache is corrupted. Delete `rm -rf local_cache/fast-bge-small-en-v1.5*` and the model will re-download automatically.
