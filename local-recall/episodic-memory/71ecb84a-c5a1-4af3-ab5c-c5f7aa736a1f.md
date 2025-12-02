---
id: 71ecb84a-c5a1-4af3-ab5c-c5f7aa736a1f
subject: >-
  Local Recall memory system is designed for knowledge persistence across AI
  assistant sessions
keywords:
  - local-recall
  - architecture
  - memory-system
  - ai-assistants
applies_to: global
occurred_at: '2025-12-02T21:16:16.583Z'
content_hash: 5a2d114e3f1802c1
---
Local Recall is a markdown-powered memory system that enables AI coding assistants (Claude Code and others via MCP) to retain information across sessions. Key architectural aspects:

- Memories are stored as structured markdown files in `local-recall/episodic-memory/`
- Each memory has YAML frontmatter with metadata (id, subject, keywords, applies_to, occurred_at, content_hash)
- Memory files are version-controlled in git, making them shareable among team members
- A SQLite database (`memory.sqlite`, gitignored) provides semantic search via vector embeddings
- Uses fastembed with BGE-small-en-v1.5 model for embedding generation
- Integrated with Claude Code via hooks (SessionStart, UserPromptSubmit) and MCP server
- Memories are idempotent and deduplicated by occurred_at and content_hash
