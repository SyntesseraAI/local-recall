---
id: ddf3b440-451d-4a6f-a765-cedebca9d3d5
subject: >-
  Ah, the `scripts/` pattern at line 142 is catching
  `local-recall-plugin/scripts/` because it's a...
applies_to: global
occurred_at: '2025-12-20T18:52:45.234Z'
content_hash: 2bbe5976c8be34d9
---
## Thought

Ah, the `scripts/` pattern at line 142 is catching `local-recall-plugin/scripts/` because it's a general pattern. I need to negate it for the plugin specifically:

## Output

The generic `scripts/` pattern is still catching the plugin scripts. Let me fix that:
