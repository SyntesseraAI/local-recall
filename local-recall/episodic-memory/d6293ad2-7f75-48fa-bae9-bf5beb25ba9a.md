---
id: d6293ad2-7f75-48fa-bae9-bf5beb25ba9a
subject: SessionStart hook reads only 5 most recent episodic memories from files
keywords:
  - sessionstart
  - episodic memory
  - recency
  - file system
  - memory injection
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-21T18:16:18.307Z'
content_hash: 32ee2483e9743dec
---
## Implementation Details
The SessionStart hook does NOT use vector search - it directly reads memory files:
1. Reads all episodic memory files from `local-recall/episodic-memory/`
2. Parses YAML frontmatter to extract `occurred_at` timestamp
3. Sorts by `occurred_at` in descending order (most recent first)
4. Selects only the first 5 memories
5. Outputs memory content directly to stdout for context injection

## Why This Design
- Avoids vector embedding overhead on session start
- Provides recent context without semantic search
- Simple and fast - no Ollama dependency for this hook
- Recency-based ordering ensures latest relevant context

## Configuration
Max context memories configured via `LOCAL_RECALL_MAX_CONTEXT` env var (default: 10 in code)
