---
id: dcf60ebe-5f42-4f2e-a5e0-2dfda993b1f9
subject: >-
  Local Recall project is a markdown-powered memory system for AI coding
  assistants
keywords:
  - local-recall
  - memory-system
  - architecture
  - project-overview
  - ai-agents
applies_to: global
occurred_at: '2025-12-02T22:03:51.197Z'
content_hash: b4dbd7cd513ba55e
---
Local Recall is a persistent memory layer that allows Claude Code and other AI tools (via MCP) to retain information and context across sessions through structured markdown files. All memories are stored locally in the repository, making them version-controllable and shareable among team members.

Key architectural components:
- Core memory management (CRUD operations, vector store with SQLite)
- Claude Code hooks (SessionStart, UserPromptSubmit, Stop)
- MCP server for exposing memory tools
- Background daemon for transcript processing

Memory files use YAML frontmatter with fields like `id`, `subject`, `keywords`, `applies_to`, `occurred_at`, and `content_hash` for deduplication.
