---
id: edb5eb1e-2b77-488e-add3-edeb90c2cb88
subject: >-
  Local Recall stores all memory files in Git (not gitignored except index and
  logs)
keywords:
  - git
  - version-control
  - memory-files
  - gitignore
  - episodic-memory
  - index
applies_to: global
occurred_at: '2025-12-01T22:41:29.475Z'
content_hash: e348ed3c1d010ffc
---
# Memory File Version Control

## What's Tracked

**Tracked in Git:**
- All memory markdown files in `local-recall/episodic-memory/*.md`
- These are version-controlled and shared among team members

**NOT Tracked (Gitignored):**
- `local-recall/index.json` - Auto-generated keyword index, specific to each environment
- `local-recall/recall.log` - Debug logs, machine-specific
- `local_cache/` - Embedding model cache

## Implications

- Memory files are permanent, persistent artifacts
- They grow over time and should be treated as project documentation
- Team members see and can review memories created by other AI assistants
- The `.gitignore` file in `local-recall/` is auto-generated to exclude index and logs

## Best Practice

When creating memories, ensure they're useful long-term artifacts. Don't create memories for temporary debugging or one-off solutions that won't help future work.
