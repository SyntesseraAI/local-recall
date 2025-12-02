---
id: c6fdb26f-5dc4-47d0-87a2-b2cefda552ae
subject: >-
  Memory extraction uses Claude API with streaming and structured output for
  parsing transcripts
keywords:
  - memory extraction
  - claude api
  - streaming
  - structured output
  - transcript parsing
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T15:54:24.318Z'
content_hash: 18ede44cd65cb023
---
The memory extractor in `src/core/memory-extractor.ts` uses the Anthropic Claude API with streaming enabled and structured output format. It processes session transcripts to extract memories using a system prompt that guides the extraction process. The implementation uses `Anthropic` client from '@anthropic-ai/sdk' and handles streaming responses efficiently.
