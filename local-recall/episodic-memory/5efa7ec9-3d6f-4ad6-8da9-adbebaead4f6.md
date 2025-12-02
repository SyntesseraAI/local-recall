---
id: 5efa7ec9-3d6f-4ad6-8da9-adbebaead4f6
subject: >-
  Memory extraction uses Claude Haiku with structured prompts and streaming for
  transcript analysis
keywords:
  - memory extraction
  - haiku
  - streaming
  - transcript analysis
  - claude
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T16:00:24.564Z'
content_hash: 92b765883771bf20
---
The memory extraction system in `src/core/memory-extractor.ts` uses Claude Haiku with streaming to analyze session transcripts. The system:

- Calls `claude -p --model haiku` with a structured extraction prompt
- Uses streaming to process transcript content in real-time
- Parses returned memories as JSON from stdout
- Handles both successful extraction and empty results
- Integrates with the memory-extraction prompt system for consistent prompting

This approach allows efficient, cost-effective transcript analysis while maintaining consistency with the extraction criteria and guidelines.
