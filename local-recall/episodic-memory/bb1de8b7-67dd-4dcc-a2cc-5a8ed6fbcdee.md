---
id: bb1de8b7-67dd-4dcc-a2cc-5a8ed6fbcdee
subject: Claude response parsing for memory extraction needs robustness improvements
keywords:
  - response validation
  - json parsing
  - memory format
  - error handling
  - memory-extractor.ts
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:26:44.653Z'
content_hash: 9a96a89376599557
---
The `parseClaudeResponse` function needs to be more defensive when parsing Claude's responses. Currently it can wrap incomplete or empty objects in the memories array without proper validation. The function should: (1) validate each memory object has required fields (subject, keywords, applies_to, content), (2) filter out empty objects before returning, (3) provide better error messages when validation fails, and (4) handle edge cases where Claude returns unexpected JSON structures.
