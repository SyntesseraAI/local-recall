---
id: 02c1cde1-9fed-4c58-bace-9ffcb6f43b72
subject: >-
  Keyword extraction task requires Claude to analyze transcript for keywords
  only
keywords:
  - keyword-extraction
  - memory-extraction
  - transcript-analysis
  - json-output
applies_to: global
occurred_at: '2025-12-01T16:30:45.842Z'
content_hash: 0b7304694d0dbc9a
---
# Memory Extraction Task Structure

When the memory extraction process receives a task to extract keywords from text, it should:

1. Return only a JSON array of strings (the keywords)
2. Include no explanation or markdown formatting
3. Return raw JSON only

The full memory extraction task then uses these keywords to create structured memory objects with:
- `subject`: Brief one-line description
- `keywords`: Array of searchable keywords
- `applies_to`: Scope (global, file:<path>, or area:<name>)
- `content`: Detailed markdown content

This is part of the LOCAL_RECALL_INTERNAL memory extraction system used in the local-recall project.
