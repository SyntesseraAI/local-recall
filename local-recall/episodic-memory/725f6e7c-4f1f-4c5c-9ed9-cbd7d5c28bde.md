---
id: 725f6e7c-4f1f-4c5c-9ed9-cbd7d5c28bde
subject: SessionStart hook outputs 5 most recent memories directly from files
keywords:
  - hooks
  - session-start
  - recent-memories
  - recency
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-21T18:57:37.986Z'
content_hash: 37acfb263b4115c5
---
The SessionStart hook reads the 5 most recent memory files (sorted by occurred_at) and outputs them to stdout for context injection. This doesn't use semantic search - it just retrieves recent memories to bootstrap context at session start.
