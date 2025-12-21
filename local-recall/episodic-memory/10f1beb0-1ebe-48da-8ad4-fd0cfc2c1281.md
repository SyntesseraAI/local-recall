---
id: 10f1beb0-1ebe-48da-8ad4-fd0cfc2c1281
subject: JSON-only output requirement enforced in memory extraction
keywords:
  - json output
  - memory extraction
  - schema validation
  - prompt engineering
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-21T19:22:59.576Z'
content_hash: 14b922043d097e4d
---
The memory extraction prompt explicitly requires that Claude return ONLY valid JSON with no explanation, markdown formatting, or code blocks (line 120). Combined with `--max-turns 1` in the CLI invocation, this ensures clean, parseable output. The prompt structure in `buildMemoryExtractionPrompt()` makes it clear that the expected return format is a JSON object with a 'memories' array containing memory objects with 'subject', 'keywords', 'applies_to', and 'content' fields.
