---
id: be819b6f-cd48-4ea2-bebb-35efa40eb26f
subject: >-
  Memory extraction uses Claude API with specific prompt structure and retry
  logic
keywords:
  - memory extraction
  - claude api
  - prompt engineering
  - retry logic
  - memory-extractor
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T07:22:02.064Z'
content_hash: 9d72c88de0a03b7f
---
The memory extraction system in `src/core/memory-extractor.ts` uses the Claude API to process transcripts and extract memories. Key implementation details:

- Uses `Anthropic` client to call Claude with a structured prompt from `src/prompts/memory-extraction.ts`
- Implements retry logic with exponential backoff for API failures
- Processes transcript content and validates extracted memories
- Returns array of memory objects with required frontmatter fields (id, subject, keywords, applies_to, occurred_at, content_hash)
- Handles both successful extractions and error cases gracefully
