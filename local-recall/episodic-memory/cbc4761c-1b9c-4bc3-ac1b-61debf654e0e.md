---
id: cbc4761c-1b9c-4bc3-ac1b-61debf654e0e
subject: Episodic memory is disabled by default in configuration
keywords:
  - episodic memory
  - default configuration
  - disabled
  - env vars
  - LOCAL_RECALL_EPISODIC_ENABLED
applies_to: global
occurred_at: '2025-12-21T18:25:49.022Z'
content_hash: 0f061135ea5a85e0
---
Changed the default value of `episodicEnabled` from `true` to `false` in the configuration schema. This means episodic memory retrieval is now disabled by default and users must explicitly enable it by setting `LOCAL_RECALL_EPISODIC_ENABLED=true` environment variable or adding `"episodicEnabled": true` to `.local-recall.json` config file.

The schema definition is located in `src/core/types.ts` line 118 where the Zod schema uses `.default(false)` for the `episodicEnabled` field.

This change was also documented in CLAUDE.md in the configuration table.
