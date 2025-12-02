---
id: ac2e6205-cfbf-4f2f-a4e6-e981bcfba984
subject: >-
  BGE-small-en-v1.5 embedding model downloads ~133MB on first run and caches in
  local_cache/
keywords:
  - embedding-model
  - fastembed
  - bge-small-en-v1.5
  - cache
  - model-download
  - first-run
applies_to: global
occurred_at: '2025-12-02T11:48:21.189Z'
content_hash: a5be8537148299c8
---
Local Recall uses fastembed library with BGE-small-en-v1.5 model for semantic search. First startup takes 30-60 seconds as model downloads (~133MB) to `local_cache/` directory. Subsequent runs load from cache. Corrupted cache can be fixed by removing `local_cache/fast-bge-small-en-v1.5*` directories.
