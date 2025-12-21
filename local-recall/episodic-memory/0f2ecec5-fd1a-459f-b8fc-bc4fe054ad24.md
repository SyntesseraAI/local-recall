---
id: 0f2ecec5-fd1a-459f-b8fc-bc4fe054ad24
subject: Memory extraction field name normalization for Claude Haiku responses
keywords:
  - memory-extractor
  - field-normalization
  - haiku-responses
  - validation
  - parsing
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-21T19:16:58.381Z'
content_hash: e43c63c066acf84d
---
Claude Haiku sometimes returns memory objects with alternative field names. Added normalization in parseClaudeResponse() (lines 179-186) to map:
- `title` → `subject`
- `tags` → `keywords`
- `scope` → `applies_to`
- `text` → `content`

This prevents Zod validation failures when Claude uses slightly different field names than expected. The normalization is applied to all parsed memory objects before validation.
