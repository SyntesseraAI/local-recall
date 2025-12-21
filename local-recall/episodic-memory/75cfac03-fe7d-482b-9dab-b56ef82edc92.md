---
id: 75cfac03-fe7d-482b-9dab-b56ef82edc92
subject: >-
  Git status shows large number of untracked episodic and thinking memory files
  from recent session
keywords:
  - git-status
  - untracked-files
  - episodic-memory
  - thinking-memory
applies_to: global
occurred_at: '2025-12-21T18:22:39.533Z'
content_hash: 67d89a91373418d1
---
Large number of new memory files created in recent sessions:

**Untracked episodic memories**: 260+ new files in `local-recall/episodic-memory/` (UUIDs as filenames)
**Untracked thinking memories**: 260+ new files in `local-recall/thinking-memory/` (UUIDs as filenames)

**Modified files**:
- `src/core/episodic-jsonl-store.ts`
- `src/core/jsonl-store.ts`
- `src/core/thinking-jsonl-store.ts`
- Hook files in `local-recall-plugin/`

**Deleted thinking memories**: 73 thinking memory files were deleted (marked with D in git status)

**Recent commits**:
- "chore: gitignore processed-log.jsonl files"
- "chore: track processed-log.jsonl files in git"
- "feat: add pre-computed embeddings and auto-compaction integration"
- "feat: migrate memory storage from markdown to JSONL format"

This suggests:
1. Migration from markdown-based thinking memories to JSONL is in progress
2. Episodic memories are being created frequently
3. Some cleanup or reorganization happened (73 deleted thinking memories)
4. Git ignore configuration is being adjusted to exclude index files and logs
