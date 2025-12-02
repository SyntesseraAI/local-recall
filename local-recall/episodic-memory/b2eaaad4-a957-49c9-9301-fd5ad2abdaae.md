---
id: b2eaaad4-a957-49c9-9301-fd5ad2abdaae
subject: Embedding model configuration and caching in local_cache directory
keywords:
  - embedding
  - fastembed
  - bge-small
  - model-cache
  - local-cache
  - semantic-search
applies_to: global
occurred_at: '2025-12-02T01:42:08.089Z'
content_hash: ac3723b272ba99e6
---
# Embedding Model and Caching

Local Recall uses the `fastembed` library with the BGE-small-en-v1.5 model for semantic search and memory extraction.

## Model Details

- **Model**: BGE-small-en-v1.5
- **Library**: fastembed
- **Size**: ~133MB
- **Cache Location**: `local_cache/` directory (in the project root)

## Caching Behavior

1. First run: The model downloads automatically (30-60 seconds)
2. Subsequent runs: Model loads from cache in `local_cache/`
3. The cache directory is created automatically on first use

## Troubleshooting

If you see: "Tokenizer file not found at local_cache/fast-bge-small-en-v1.5/tokenizer.json"
- The cache is corrupted or incomplete (usually from interrupted download)
- Solution: Delete `rm -rf local_cache/fast-bge-small-en-v1.5*`
- The model will re-download automatically on next run

## Usage

The embedding model is used for:
1. Extracting semantic meaning from transcript content
2. Finding relevant memories based on semantic similarity
3. Improving search accuracy beyond keyword matching
