---
id: dcfcc1db-e5ee-4be7-824c-bcc1f9cd6ef1
subject: >-
  Memory index should exclude .DS_Store and be added to .gitignore in
  local-recall/
keywords:
  - gitignore
  - macos
  - .ds_store
  - index-management
  - local-recall-directory
applies_to: 'file:local-recall/.gitignore'
occurred_at: '2025-12-01T16:18:08.357Z'
content_hash: 3cc96f1a3a184a7a
---
# Gitignore Configuration for Local Recall

The `local-recall/.gitignore` file exists but needs to explicitly exclude `.DS_Store` files that may appear in the memory directory.

## Current State

The `.gitignore` should include:
- `index.json` - auto-generated keyword index
- `recall.log` - debug log file
- `.DS_Store` - macOS system files

These files are generated at runtime and should not be committed to version control.

## Note for Development

When working on macOS (Darwin 24.6.0), ensure `.DS_Store` files don't accidentally get committed. This is especially important since the project uses git for version-controlling memory files.
