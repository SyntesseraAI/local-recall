---
id: fabae6ef-32fc-419d-a84d-a8f913b4dabe
subject: Memory extraction prompt is centralized in src/prompts/memory-extraction.ts
keywords:
  - memory-extraction
  - prompts
  - claude-prompt
  - extraction-template
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-02T06:59:41.419Z'
content_hash: f0cbee9a4d6a4123
---
The Claude prompt used for memory extraction is stored in a separate file `src/prompts/memory-extraction.ts`. This keeps the extraction logic DRY and makes it easier to refine the prompt without changing the core extraction code. The prompt instructs Claude how to generate appropriate keywords and subjects from transcript content.
