---
id: 6fc85efe-8f7e-47a0-9e74-7edfcae7d1b5
subject: >-
  SessionStart hook loads 5 most recent memories without vector store for
  performance
keywords:
  - hooks
  - session-start
  - performance
  - memory-loading
  - claude-integration
applies_to: 'area:hooks'
occurred_at: '2025-12-02T16:41:18.394Z'
content_hash: c521a588a683cfc3
---
The SessionStart hook (src/hooks/session-start.ts) loads all memories from disk via MemoryManager.listMemories() and returns the 5 most recent memories sorted by occurred_at. It intentionally avoids using the vector store to prevent slow initialization on every session start.
