---
id: fd4abd7b-33b0-4d88-98fb-b3c35ae2e7cf
subject: Memories have an applies_to scope field for targeting relevance
keywords:
  - applies_to
  - scope
  - global
  - 'file:'
  - 'area:'
  - memory targeting
applies_to: global
occurred_at: '2025-12-01T15:52:44.349Z'
content_hash: ea922d73bf95c0d1
---
Each memory has an applies_to field that determines its scope and relevance:
- `global` - Applies to the entire codebase
- `file:<path>` - Specific to a particular file (e.g., file:src/utils/config.ts)
- `area:<name>` - Related to a component or area (e.g., area:authentication)

This scope helps Claude retrieve only relevant memories based on the current context.
