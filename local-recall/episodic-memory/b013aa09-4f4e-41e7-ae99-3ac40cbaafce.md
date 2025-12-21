---
id: b013aa09-4f4e-41e7-ae99-3ac40cbaafce
subject: IndexManager and index.json are redundant after SQLite migration
keywords:
  - indexmanager
  - redundant
  - sqlite
  - vector-store
  - cleanup
applies_to: global
occurred_at: '2025-12-21T19:15:38.757Z'
content_hash: 5dee2862d048450e
---
After migrating to SQLite with vector embeddings, the IndexManager class and index.json file became redundant. The vector store now handles all memory indexing and search. Removed IndexManager entirely, deleted src/core/index.ts, removed all references from mcp-server/tools.ts, hooks/stop.ts, core/memory-extractor.ts, and tests. The index_rebuild MCP tool was replaced with a simple sync call to VectorStore.sync().
