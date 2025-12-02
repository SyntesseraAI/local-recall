---
id: db78280d-d2f1-4ede-b3de-a74aa68f63fb
subject: >-
  Local Recall project is a markdown-powered memory system for AI coding
  assistants
keywords:
  - local-recall
  - memory-system
  - architecture
  - markdown
  - persistent-memory
applies_to: global
occurred_at: '2025-12-02T16:26:42.314Z'
content_hash: b700230e50ff6536
---
Local Recall is a local markdown-powered memory system that enables Claude Code and other AI tools (via MCP) to retain information and context across sessions through structured markdown files. All memories are stored locally within the repository and are version-controllable and shareable among team members.

Key architectural components:
- Memory storage in episodic-memory/ directory with YAML frontmatter markdown files
- SQLite vector store with BGE-small-en-v1.5 embedding model for semantic search
- Claude Code hooks for session-start and user-prompt-submit
- MCP server exposing memory tools to compatible clients
- Background daemon processing transcripts asynchronously
