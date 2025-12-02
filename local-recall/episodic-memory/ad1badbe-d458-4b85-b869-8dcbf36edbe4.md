---
id: ad1badbe-d458-4b85-b869-8dcbf36edbe4
subject: Memory extractor uses Claude API to extract memories from transcripts
keywords:
  - memory-extractor
  - transcript
  - claude-api
  - memory-extraction
  - async
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T23:06:46.320Z'
content_hash: 160f5765bd36bb32
---
The memory extractor in `src/core/memory-extractor.ts` processes transcripts by sending them to Claude's API (likely Haiku model) to extract structured memories. The implementation uses async/await patterns and integrates with the memory creation system to store extracted memories. Uses `claude -p` subprocess calls for extraction.
