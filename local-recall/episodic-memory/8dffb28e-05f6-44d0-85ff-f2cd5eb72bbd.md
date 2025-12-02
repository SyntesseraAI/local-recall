---
id: 8dffb28e-05f6-44d0-85ff-f2cd5eb72bbd
subject: >-
  Local Recall architecture uses markdown files with YAML frontmatter for memory
  storage and SQLite with vector embeddings for semantic search
keywords:
  - architecture
  - memory-storage
  - markdown
  - yaml-frontmatter
  - sqlite
  - vector-embeddings
  - semantic-search
applies_to: global
occurred_at: '2025-12-02T21:48:36.776Z'
content_hash: 1eeb5364c7576cbd
---
Local Recall stores all memories as structured markdown files in `local-recall/episodic-memory/` with YAML frontmatter containing metadata (id, subject, keywords, applies_to, occurred_at, content_hash). A SQLite database with the sqlite-vec extension stores vector embeddings for semantic search using the BGE-small-en-v1.5 model from fastembed. The SQLite database is gitignored, but markdown memory files are version-controlled.
