---
id: f6cdfc9a-9fe5-4dc6-9250-2acf3dfa02c1
subject: IndexManager and MemoryManager both need to ensure .gitignore exists
keywords:
  - initialization
  - gitignore
  - index-manager
  - memory-manager
  - idempotent
applies_to: global
occurred_at: '2025-12-01T16:13:05.103Z'
content_hash: e3ea557bd320c825
---
Both IndexManager and MemoryManager should independently ensure the `.gitignore` file exists in the `local-recall/` directory. This follows the idempotent pattern - each manager ensures its prerequisites are met when initialized, regardless of call order. This prevents issues where memory operations fail if IndexManager hasn't been invoked yet.
