---
id: 13dfcbd9-6d08-4bc7-a1ca-bf3ea0f7e241
subject: >-
  Local Recall is a markdown-powered memory system for AI coding assistants with
  MCP integration
keywords:
  - local-recall
  - memory-system
  - mcp
  - plugin
  - architecture
applies_to: global
occurred_at: '2025-12-02T06:10:31.578Z'
content_hash: 40231ec23a0bca3a
---
Local Recall enables Claude Code and other AI tools to retain information across sessions through structured markdown files stored in the repository. It uses hooks for SessionStart, UserPromptSubmit, and Stop events to manage memory lifecycle. The project includes an MCP server for exposing memory tools to compatible clients. All memories are version-controlled and stored in local-recall/episodic-memory/ directory.
