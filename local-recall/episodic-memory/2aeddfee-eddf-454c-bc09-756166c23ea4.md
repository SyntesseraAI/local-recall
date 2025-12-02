---
id: 2aeddfee-eddf-454c-bc09-756166c23ea4
subject: >-
  Memory extraction guidelines emphasize specificity, actionability, and
  appropriate scope classification
keywords:
  - extraction-guidelines
  - memory-scope
  - specificity
  - best-practices
applies_to: global
occurred_at: '2025-12-02T02:05:25.426Z'
content_hash: cc3d30a3ab2e66a5
---
When extracting memories, prioritize:
- **Specificity**: Include file paths, function names, concrete details
- **Actionability**: Memories should help future assistants avoid mistakes or work efficiently
- **Scope accuracy**: Use `global` for architecture/conventions, `file:<path>` for specific files, `area:<name>` for components
- **What to exclude**: Generic programming knowledge, temporary debugging steps, trivial info, sensitive data, outdated info
- **What to include**: Architectural decisions, bug fixes with root cause, code patterns, configuration quirks, user preferences, component relationships, performance considerations
