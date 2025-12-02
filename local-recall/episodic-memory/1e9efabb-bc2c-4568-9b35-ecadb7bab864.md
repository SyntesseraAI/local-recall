---
id: 1e9efabb-bc2c-4568-9b35-ecadb7bab864
subject: >-
  SQLite database and debug log are gitignored but episodic memories are
  version-controlled
keywords:
  - git-strategy
  - version-control
  - gitignore
  - memory-persistence
applies_to: global
occurred_at: '2025-12-02T11:45:36.373Z'
content_hash: 4fd43fc48428cd10
---
Version control strategy:
- `local-recall/memory.sqlite` is gitignored (auto-generated)
- `local-recall/recall.log` is gitignored (debug log)
- `local-recall/episodic-memory/*.md` ARE tracked in git (manually created/deleted)
- `.gitignore` in local-recall/ auto-generated and excludes memory.sqlite and recall.log

This allows teams to share memories while keeping generated artifacts local.
