---
id: edd4ecaf-b01c-47ab-ac67-ebbc3480c119
subject: Memory extraction uses Claude Haiku via stdin for efficient keyword extraction
keywords:
  - memory-extractor
  - claude-haiku
  - stdin
  - keyword-extraction
  - performance
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T07:23:57.721Z'
content_hash: b9b204adb3e85c65
---
The memory extraction system uses Claude Haiku model with stdin-based communication for keyword extraction from transcripts. This approach is memory-efficient for processing large transcripts. The extractor pipes transcript content to `claude -p --model haiku` to generate structured memory data including subject, keywords, applies_to scope, and content_hash for deduplication.
