---
id: f62542b0-18ac-4dce-bd49-c4b8bfaa8cd4
subject: >-
  Memory extractor processes transcripts to extract structured memories for the
  local-recall system
keywords:
  - memory extractor
  - transcript processing
  - memory extraction
  - claude haiku
  - structured extraction
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:03:41.648Z'
content_hash: 8977372c84a54fac
---
The memory-extractor module reads transcripts and uses Claude Haiku to extract structured memories. Key responsibilities:

- Reads transcript files from the project directory
- Uses Claude Haiku model via `claude -p` for efficient memory extraction
- Parses extraction prompts from src/prompts/memory-extraction.ts
- Validates extracted memories against the schema
- Creates memories using the memory manager
- Handles errors and tracks processing state

This is a critical component for the background daemon that processes transcripts asynchronously every 5 minutes.
