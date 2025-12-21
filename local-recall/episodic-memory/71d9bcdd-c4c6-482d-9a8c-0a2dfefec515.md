---
id: 71d9bcdd-c4c6-482d-9a8c-0a2dfefec515
subject: Episodic memory is now enabled by default in Local Recall
keywords:
  - episodic
  - enabled
  - default
  - configuration
applies_to: global
occurred_at: '2025-12-21T19:29:19.637Z'
content_hash: bec20e82a18a366b
---
Changed `episodicEnabled` default from `false` to `true` in src/core/types.ts:118. This means episodic memories will be retrieved and injected into prompts by default unless explicitly disabled via `LOCAL_RECALL_EPISODIC_ENABLED=false`.
