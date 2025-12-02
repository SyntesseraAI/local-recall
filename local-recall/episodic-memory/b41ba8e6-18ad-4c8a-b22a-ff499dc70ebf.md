---
id: b41ba8e6-18ad-4c8a-b22a-ff499dc70ebf
subject: Memory extraction uses Claude Haiku via stdin for transcript analysis
keywords:
  - memory-extractor
  - claude-haiku
  - transcript-analysis
  - stdin
  - process
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T22:45:56.122Z'
content_hash: 791e58b2bb6dfa2c
---
The memory extraction process in `memory-extractor.ts` spawns a Claude Haiku process using `child_process.spawn()` and communicates via stdin/stdout. The prompt is passed via stdin to avoid shell escaping issues. This approach allows the memory extraction to be robust and secure while maintaining compatibility with the Claude command-line interface.
