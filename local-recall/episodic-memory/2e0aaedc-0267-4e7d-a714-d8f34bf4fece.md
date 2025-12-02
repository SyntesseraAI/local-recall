---
id: 2e0aaedc-0267-4e7d-a714-d8f34bf4fece
subject: >-
  Claude Code hooks are configured in hooks.json and execute as shell commands
  receiving JSON via stdin
keywords:
  - hooks
  - claude-code-integration
  - session-start
  - user-prompt-submit
  - hooks.json
applies_to: global
occurred_at: '2025-12-02T17:09:03.470Z'
content_hash: 8beedc52133deb04
---
Local Recall integrates with Claude Code via hooks configured in hooks.json. SessionStart hook (src/hooks/session-start.ts): triggered on session begin, loads all memories, returns 5 most recent sorted by occurred_at to stdout. UserPromptSubmit hook (src/hooks/user-prompt-submit.ts): triggered before Claude processes user prompt, lazy-initializes vector store, performs semantic search, outputs matching memories. Stop hook disabled - memory extraction handled by MCP server daemon processing transcripts every 5 minutes asynchronously.
