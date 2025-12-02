---
id: ce5af7ec-a801-4f4c-9bad-f897bedb6979
subject: Memory extraction process for Local Recall system
keywords:
  - memory extraction
  - transcript analysis
  - episodic memory
  - session insights
  - knowledge capture
applies_to: global
occurred_at: '2025-12-01T15:55:03.219Z'
content_hash: 432f26474d560d5c
---
The Local Recall system extracts memories from Claude Code session transcripts to help future AI assistants. The extraction process analyzes:

1. What was learned - new knowledge or insights gained
2. What is now known - important facts about codebase, architecture, conventions
3. What is specific to this codebase - unique patterns, configurations, quirks
4. What problems were solved - bugs fixed, issues resolved, solutions applied

Memories should be specific (include file paths, function names), concise (one concept per memory), actionable (help future assistants avoid mistakes), and appropriately scoped (global, file-specific, or area-specific).

DO extract: architectural decisions, bug fixes with root cause, code patterns, configuration quirks, user preferences, component relationships, performance optimizations.

DO NOT extract: generic programming knowledge, temporary debugging steps, obvious/trivial information, sensitive data, or quickly-outdated information.
