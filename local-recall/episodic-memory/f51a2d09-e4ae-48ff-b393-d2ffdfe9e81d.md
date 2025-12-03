---
id: f51a2d09-e4ae-48ff-b393-d2ffdfe9e81d
subject: Episodic memory is disabled by default in configuration
keywords:
  - episodic memory
  - default configuration
  - disabled
  - config
  - environment variables
applies_to: global
occurred_at: '2025-12-03T11:21:38.418Z'
content_hash: 4fc05b9a82f777be
---
The `episodicEnabled` configuration option defaults to `false` as of this session. This means episodic memory retrieval is disabled by default and must be explicitly enabled via the `LOCAL_RECALL_EPISODIC_ENABLED` environment variable or `episodicEnabled: true` in `.local-recall.json` config.

This default is defined in `src/core/types.ts:118` in the Zod schema where `episodicEnabled: z.boolean().default(false)` is specified.

The change was documented in `CLAUDE.md` in the configuration options table.
