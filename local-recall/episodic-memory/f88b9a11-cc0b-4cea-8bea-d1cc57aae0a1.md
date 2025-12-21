---
id: f88b9a11-cc0b-4cea-8bea-d1cc57aae0a1
subject: SessionStart hook was timing out due to vector store initialization
keywords:
  - sessionstart
  - hook
  - timeout
  - vector-store
  - embedding-model
  - performance
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-21T19:15:38.757Z'
content_hash: 596975d975c661e5
---
The SessionStart hook was initializing the vector store on every session start, which downloads a 133MB embedding model (nomic-embed-text) on first use. This caused the hook to exceed its 30-second timeout. Fixed by removing vector store initialization from the hook - it now only loads the 5 most recent memories directly from files. Vector store is initialized lazily by the MCP server daemon or user-prompt-submit hook instead.
