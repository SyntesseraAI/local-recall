---
id: 81bc0efd-89ec-4f10-9be8-fa7bba28ab5f
subject: >-
  Memory extraction uses Claude Haiku via stdin with JSON input for prompt
  injection resistance
keywords:
  - claude haiku
  - stdin
  - memory extraction
  - prompt injection
  - security
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:20:17.102Z'
content_hash: e65bf18776bec593
---
The memory extraction process passes prompts to Claude Haiku through stdin using JSON input rather than command-line arguments. This approach prevents prompt injection attacks and provides a secure way to instruct Claude to extract memories from transcripts. The prompt is structured as a JSON object with the transcript content.
