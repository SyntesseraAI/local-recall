---
id: 9f90adbc-8406-4cc3-97ad-c6da3f44fbeb
subject: Memory scope determines applicability context
keywords:
  - memory
  - scope
  - applies_to
  - global
  - file
  - area
applies_to: global
occurred_at: '2025-12-02T01:44:04.265Z'
content_hash: 47e41beb3944d289
---
Memory scope should be set based on applicability:
- `global` - Applies to entire codebase (architecture, conventions)
- `file:<path>` - Specific to a particular file
- `area:<name>` - Related to a component or area (e.g., `area:authentication`)

Choosing the correct scope helps future assistants find relevant memories quickly.
