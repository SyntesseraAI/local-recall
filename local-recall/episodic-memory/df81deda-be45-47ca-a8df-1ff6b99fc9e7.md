---
id: df81deda-be45-47ca-a8df-1ff6b99fc9e7
subject: MCP server daemon orchestrates episodic and thinking memory extraction
keywords:
  - mcp-server
  - daemon
  - transcript-processing
  - async
  - event-loop
applies_to: 'file:src/mcp-server/server.ts'
occurred_at: '2025-12-21T18:29:45.308Z'
content_hash: 1b7b349b79c55a7e
---
The MCP server runs a background daemon that processes transcripts asynchronously. The daemon now coordinates both episodic memory extraction (via `runTranscriptProcessing()`) and thinking memory extraction (via `runThinkingExtraction()`) with separate flags to prevent concurrent runs of the same type. Both processes run independently and can process different transcripts in parallel, scheduled on the same 5-minute interval loop.
