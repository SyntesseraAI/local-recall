---
id: 9808dfbe-fb91-4e32-ac7d-cc7bdb6eecc9
subject: IndexManager and index.json are redundant with SQLite vector store
keywords:
  - indexmanager
  - redundant
  - sqlite
  - vector-store
  - refactor
applies_to: global
occurred_at: '2025-12-21T18:17:30.301Z'
content_hash: 3130596badf6b671
---
The old IndexManager class and index.json file became redundant after migrating to SQLite with vector embeddings. IndexManager provided keyword-based lookups which SQLite now handles directly. The index.json was used for caching keyword searches but SQLite index files are more efficient. Removed: src/core/index.ts, src/core/index.test.ts, and removed IndexManager from exports and all usage sites (mcp-server/tools.ts, hooks/stop.ts, core/memory-extractor.ts).
