---
id: dac3a60b-4dac-4e64-b9d5-e7f14cd5d7d9
subject: >-
  Memory extraction uses Claude API with specific system prompt and transcript
  processing
keywords:
  - memory-extractor
  - claude-api
  - system-prompt
  - transcript-processing
  - memory-extraction
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:13:55.708Z'
content_hash: 8aceb1a393b0a5e0
---
The MemoryExtractor class in src/core/memory-extractor.ts uses the Anthropic Claude API to extract memories from transcripts. It:

1. Takes a transcript text and processes it through Claude with a system prompt from src/prompts/memory-extraction.ts
2. Uses the claude-api (likely via node-sdk) to call Claude Haiku or Opus model
3. Parses Claude's response to extract structured memory objects
4. Returns an array of Memory objects with metadata (subject, keywords, applies_to, occurred_at, content_hash)

Key implementation details:
- System prompt defines how Claude should analyze transcripts
- Transcript text is passed as user input to Claude
- Response parsing handles Claude's natural language output and converts to Memory format
- Handles error cases and invalid responses gracefully
