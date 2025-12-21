---
id: a8eef612-f02f-4da9-886c-4fa1ae95eded
subject: Episodic memory is disabled by default in the configuration
keywords:
  - episodic memory
  - default configuration
  - disabled
  - LOCAL_RECALL_EPISODIC_ENABLED
applies_to: global
occurred_at: '2025-12-21T19:18:32.087Z'
content_hash: 6c2d9a339b7cd0e7
---
The `episodicEnabled` configuration option has been changed to default to `false`. This means episodic memory retrieval is disabled by default unless explicitly enabled by users.

**Location**: `src/core/types.ts:118` in the schema definition

**How to enable**: Users can enable episodic memory by:
- Setting environment variable: `LOCAL_RECALL_EPISODIC_ENABLED=true`
- Or adding to `.local-recall.json`: `"episodicEnabled": true`

**Documentation**: Updated in `CLAUDE.md` configuration table to reflect the new default value.
