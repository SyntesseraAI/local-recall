---
id: b1b75e9f-f70d-47ac-bdda-8ffd7cc946a6
subject: Local Recall project dependencies and module imports
keywords:
  - dependencies
  - imports
  - better-sqlite3
  - fastembed
  - typescript
applies_to: global
occurred_at: '2025-12-02T21:51:26.713Z'
content_hash: 50e5a0c565a1ebac
---
# Key Dependencies

Local Recall uses:
- **better-sqlite3** - SQLite database driver for the vector store
- **fastembed** - Embedding library with BGE-small-en-v1.5 model for semantic search
- **TypeScript 5.9+** - Language and compilation

These dependencies are critical for:
1. Vector store operations (similarity search)
2. Memory embeddings generation
3. Database operations

Any changes to these dependencies require careful testing, especially the embedding model as it significantly affects search quality.
