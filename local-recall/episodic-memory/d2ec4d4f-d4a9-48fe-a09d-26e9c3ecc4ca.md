---
id: d2ec4d4f-d4a9-48fe-a09d-26e9c3ecc4ca
subject: Memory extraction uses Claude Haiku via stdin with -p flag for prompt mode
keywords:
  - memory extraction
  - claude haiku
  - stdin
  - prompt mode
  - '-p flag'
applies_to: global
occurred_at: '2025-12-01T15:52:38.425Z'
content_hash: 062f647a5c865c26
---
The memory extraction system in memory-extractor.ts uses Claude Haiku model by invoking `claude -p` command with input passed via stdin. The `-p` flag indicates prompt mode. This approach allows for efficient processing of transcripts to extract structured memories without requiring API calls.
