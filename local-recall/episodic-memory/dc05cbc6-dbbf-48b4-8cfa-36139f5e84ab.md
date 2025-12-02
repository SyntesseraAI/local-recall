---
id: dc05cbc6-dbbf-48b4-8cfa-36139f5e84ab
subject: >-
  Local Recall project is a markdown-powered memory system for Claude Code and
  AI assistants
keywords:
  - local-recall
  - memory-system
  - claude-code
  - architecture
  - markdown
applies_to: global
occurred_at: '2025-12-02T21:12:32.778Z'
content_hash: b0dfbc3c9a6e49c4
---
Local Recall is a persistent memory layer that allows Claude Code and other AI tools (via MCP) to retain information and context across sessions. All memories are stored as structured markdown files in the local-recall/episodic-memory/ directory with YAML frontmatter metadata including: id, subject, keywords, applies_to, occurred_at, and content_hash. Memory files are version-controlled and shareable among team members.
