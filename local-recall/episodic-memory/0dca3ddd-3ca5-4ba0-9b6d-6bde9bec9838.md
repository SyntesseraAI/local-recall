---
id: 0dca3ddd-3ca5-4ba0-9b6d-6bde9bec9838
subject: >-
  Memory extractor analyzes condensed transcripts to identify and create
  memories
keywords:
  - memory extraction
  - transcript analysis
  - memory creation
  - deduplication
  - content hash
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:34:59.079Z'
content_hash: 49117f21f5f605e2
---
The memory extractor (`src/core/memory-extractor.ts`) processes condensed transcripts to identify valuable memories worth persisting. It analyzes events and conversations to extract learnings, bug fixes, architectural decisions, and code patterns. The extractor handles deduplication using content hashes and occurred_at timestamps to prevent duplicate memories. It generates appropriate keywords and scope for each memory based on the context and affected files.
