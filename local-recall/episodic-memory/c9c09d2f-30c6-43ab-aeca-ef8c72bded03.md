---
id: c9c09d2f-30c6-43ab-aeca-ef8c72bded03
subject: >-
  Memory extraction uses Claude Haiku via claude -p for keyword extraction from
  transcripts
keywords:
  - memory extraction
  - claude haiku
  - transcript processing
  - keyword extraction
  - memory-extractor.ts
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T23:17:43.750Z'
content_hash: a255f490ee8e5705
---
The memory extraction process uses `claude -p --model haiku` to process transcripts and extract keywords. The MemoryExtractor class in src/core/memory-extractor.ts handles this workflow:

1. Reads transcript files from Claude's cache
2. Uses Claude Haiku to extract relevant keywords and memory content
3. Creates memory objects with proper metadata (id, subject, keywords, applies_to, occurred_at, content_hash)
4. Handles deduplication by checking for existing memories with matching content_hash and occurred_at
5. Stores memories in the episodic-memory directory

This is the primary mechanism for converting session transcripts into searchable, persistent memories.
