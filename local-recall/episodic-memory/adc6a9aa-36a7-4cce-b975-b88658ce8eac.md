---
id: adc6a9aa-36a7-4cce-b975-b88658ce8eac
subject: Memory extraction uses Claude API with specific prompts for semantic analysis
keywords:
  - memory-extractor
  - claude-api
  - prompt-engineering
  - transcript-analysis
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T01:40:07.717Z'
content_hash: 3931bf1a09aeef30
---
The memory extraction system uses the Claude API to analyze transcripts and extract semantically meaningful memories. The process involves:

1. Reading transcript content from files
2. Sending transcript chunks to Claude with a specialized prompt
3. Parsing Claude's response to extract structured memory data
4. Deduplicating based on content_hash and occurred_at timestamp

Key implementation details:
- Transcript chunking strategy is used to handle large files
- Claude's response format includes subject, keywords, applies_to scope, and content
- Memory extraction happens asynchronously, triggered by background processes
- Deduplication prevents duplicate memories from being created
