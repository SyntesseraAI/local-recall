---
id: 2c6cbadd-0dc4-4f8a-8caf-4bfdd521888c
subject: >-
  Claude Code integration uses three main hooks: SessionStart, UserPromptSubmit,
  and Stop
keywords:
  - hooks
  - integration
  - session-start
  - user-prompt-submit
  - stop
applies_to: global
occurred_at: '2025-12-02T12:40:22.972Z'
content_hash: d8c91a979018e967
---
Claude Code integration includes:

1. **SessionStart Hook**: Loads 5 most recent memories (sorted by occurred_at) on session start, injects them into Claude's context. Full reload, no vector store initialization.

2. **UserPromptSubmit Hook**: Triggers semantic search when user submits a prompt. Initializes vector store (lazy, cached after first use), performs embedding-based search, injects matching memories into context.

3. **Stop Hook**: Currently disabled. Memory extraction is handled by MCP server daemon running asynchronously every 5 minutes instead.
