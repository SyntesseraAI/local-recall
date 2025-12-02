---
id: 7fbcb20e-e07c-474d-b4f5-69f05afeaced
subject: >-
  Transcript processing architecture uses MemoryExtractor class for structured
  extraction
keywords:
  - memory extractor
  - class based
  - structured extraction
  - typescript
  - architecture
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:15:17.195Z'
content_hash: 21aadf94fb3c95bb
---
The `MemoryExtractor` class in `src/core/memory-extractor.ts` provides a structured way to extract memories from transcripts. The class encapsulates the logic for calling the extraction process via `claude -p` and handles the streaming response parsing.
