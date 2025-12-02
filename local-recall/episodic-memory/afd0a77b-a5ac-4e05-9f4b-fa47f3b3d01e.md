---
id: afd0a77b-a5ac-4e05-9f4b-fa47f3b3d01e
subject: Memory extraction follows specific guidelines for quality and relevance
keywords:
  - memory guidelines
  - extraction criteria
  - memory quality
  - specificity
applies_to: global
occurred_at: '2025-12-01T16:26:02.424Z'
content_hash: 138ece399ecec2ee
---
Memories should be:
- **Specific**: Include file paths, function names, concrete details
- **Concise**: One concept per memory
- **Actionable**: Help future assistants avoid mistakes or work efficiently
- **Properly scoped**: Use `global`, `file:<path>`, or `area:<name>` appropriately

Memories should extract: architectural decisions, bug fixes with root cause analysis, code patterns, configuration quirks, user preferences, component relationships, and performance considerations.

Memories should NOT extract: generic programming knowledge, temporary debugging steps, obvious information, sensitive data, or quickly-outdated information.
