---
id: da698fea-aff9-4018-bc47-e5d3ed127cdb
subject: Memory extraction prompt is externalized and configurable
keywords:
  - prompt
  - memory extraction
  - configuration
  - external
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:02:18.831Z'
content_hash: b02eee57ba222ef0
---
The memory extraction prompt is stored separately in `src/prompts/memory-extraction.ts` rather than hardcoded. This allows the extraction prompt to be tuned and improved without modifying the core `MemoryExtractor` class. The prompt defines the structure and expectations for extracted memories.
