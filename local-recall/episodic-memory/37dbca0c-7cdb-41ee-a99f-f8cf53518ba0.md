---
id: 37dbca0c-7cdb-41ee-a99f-f8cf53518ba0
subject: >-
  Local Recall project is a memory system plugin for Claude Code that stores
  memories as markdown files with YAML frontmatter
keywords:
  - architecture
  - local-recall
  - memory-system
  - plugin
  - markdown
  - yaml
applies_to: global
occurred_at: '2025-12-02T08:02:29.715Z'
content_hash: d59e7c3b59fc143b
---
Local Recall is a markdown-powered memory system for Claude Code that allows AI assistants to retain context across sessions. All memories are stored as markdown files with YAML frontmatter in the `local-recall/episodic-memory/` directory. The project is itself a Claude Code plugin installed via the plugin system or directly as an MCP server.

**Key architectural components:**
- Core memory management in `src/core/` (memory.ts, index.ts, search.ts)
- Claude Code hooks in `src/hooks/` for SessionStart, UserPromptSubmit, and Stop events
- MCP server in `src/mcp-server/` exposing memory tools
- Utilities for markdown parsing, transcript processing, fuzzy matching, and logging
- Background daemon (MCP server) that processes transcripts every 5 minutes to extract memories

**Memory file format:**
Each memory has YAML frontmatter with id, subject, keywords, applies_to scope, occurred_at timestamp, and content_hash for deduplication. Content hash uses SHA-256 prefix (16 chars).
