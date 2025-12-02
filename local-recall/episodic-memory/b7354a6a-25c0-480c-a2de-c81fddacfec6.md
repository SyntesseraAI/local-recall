---
id: b7354a6a-25c0-480c-a2de-c81fddacfec6
subject: Memory extraction prompt guides Haiku model to output JSON memories
keywords:
  - memory-extraction
  - prompt-engineering
  - json-output
  - structured-extraction
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:14:52.811Z'
content_hash: cc407c1c0a7c763c
---
The memory extraction prompt in src/prompts/memory-extraction.ts is designed to guide Claude models (Haiku recommended for cost) to analyze transcripts and output JSON memories.

Prompt structure:
1. Context about Local Recall system and memory format
2. Guidelines for what to extract and what to skip
3. Output format specification with JSON schema expectations
4. Instructions to output ONLY JSON with no explanation

The prompt expects memories with: subject, keywords, applies_to, and content fields in JSON format.
