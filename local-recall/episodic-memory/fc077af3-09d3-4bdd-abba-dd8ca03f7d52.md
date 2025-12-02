---
id: fc077af3-09d3-4bdd-abba-dd8ca03f7d52
subject: >-
  Local Recall is a markdown-powered memory system for AI coding assistants with
  Claude Code integration
keywords:
  - local-recall
  - memory-system
  - claude-code
  - plugin
  - mcp-server
  - architecture
applies_to: global
occurred_at: '2025-12-02T11:55:17.139Z'
content_hash: a5a2df1629a4d0d0
---
Local Recall enables Claude Code and other AI tools to retain information and context across sessions through structured markdown files stored in a version-controlled local-recall directory. The system uses hooks (SessionStart, UserPromptSubmit, Stop) and an MCP server for integration. All memories use YAML frontmatter with fields: id, subject, keywords, applies_to, occurred_at, and content_hash.
