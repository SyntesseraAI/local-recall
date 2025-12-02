---
id: cf72f38d-c019-4dea-af1b-7de3addcbfdd
subject: Memory files are version-controlled while database is gitignored
keywords:
  - git
  - version control
  - gitignore
  - memory files
  - database persistence
applies_to: global
occurred_at: '2025-12-02T17:21:11.432Z'
content_hash: 2a1c3307cd4db3c5
---
Individual memory markdown files in `local-recall/episodic-memory/` are version-controlled and tracked in git. The SQLite database (`local-recall/memory.sqlite`), embedding cache (`local_cache/`), and debug log (`recall.log`) are all gitignored and auto-generated.
