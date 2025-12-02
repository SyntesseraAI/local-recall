---
id: cb173f80-e8ad-46ec-920a-95bddfe40faa
subject: >-
  Memory extraction pipeline uses Claude Haiku for keyword extraction with
  specific prompt format
keywords:
  - memory extraction
  - claude haiku
  - keyword extraction
  - json output format
  - transcript analysis
applies_to: global
occurred_at: '2025-12-02T06:19:00.665Z'
content_hash: fc302389c0248d93
---
The memory extraction process calls Claude Haiku with `--output-format json` flag to extract keywords from transcript text. The prompt in `src/prompts/memory-extraction.ts` requests Claude to return a JSON array of strings representing keywords. The response must be carefully parsed since Claude may return the array directly or wrapped in an object with a `memories` key, and may return empty or malformed responses when processing minimal input.
