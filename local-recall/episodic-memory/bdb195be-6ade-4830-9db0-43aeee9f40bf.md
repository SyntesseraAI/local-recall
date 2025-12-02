---
id: bdb195be-6ade-4830-9db0-43aeee9f40bf
subject: Memory files are version-controlled and part of git repository
keywords:
  - git
  - version-control
  - memory-files
  - gitignore
  - episodic-memory
applies_to: global
occurred_at: '2025-12-02T11:48:49.452Z'
content_hash: a1b36b43ef7b0610
---
**IMPORTANT:** Memory files stored in `local-recall/episodic-memory/*.md` ARE version-controlled and will be committed to git.

**What is gitignored:**
- `local-recall/memory.sqlite` - Auto-generated SQLite database with vector embeddings
- `local-recall/recall.log` - Debug log file
- `local_cache/` - Embedding model cache directory

**What is tracked:**
- All `.md` files in `local-recall/episodic-memory/`
- `.claude-plugin/plugin.json`
- `hooks.json`
- `.mcp.json`
- Source code in `src/`

This design allows memories to be shared among team members while keeping generated artifacts local.
