---
id: dff8cf2f-ac7d-4754-85cd-46cea2d23bb0
subject: Embedding model download and caching behavior
keywords:
  - embedding
  - fastembed
  - bge-small
  - model
  - cache
  - download
applies_to: global
occurred_at: '2025-12-02T06:01:04.817Z'
content_hash: 91035dd5bd1ec417
---
Local Recall uses BGE-small-en-v1.5 embedding model for semantic search:
- Model is ~133MB and auto-downloads on first use
- Cached in `local_cache/` directory
- Initial startup may take 30-60 seconds (model download)
- Subsequent runs load from cache for faster startup
- If cache corrupts (incomplete download), delete `local_cache/fast-bge-small-en-v1.5*` to trigger re-download
- Part of fastembed library integration for semantic vector search
