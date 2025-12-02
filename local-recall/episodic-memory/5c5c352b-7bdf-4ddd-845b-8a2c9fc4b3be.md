---
id: 5c5c352b-7bdf-4ddd-845b-8a2c9fc4b3be
subject: Transcript condensing reduces token usage in memory extraction process
keywords:
  - transcript-condensing
  - token-optimization
  - memory-extraction
  - transcript-processing
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T22:08:03.556Z'
content_hash: 2c97ac5e5fbbea06
---
The memory extraction pipeline includes transcript condensing to reduce token usage when processing transcripts with Claude. This is important for cost and performance optimization when analyzing long session transcripts. The condensing step summarizes or filters transcript content before semantic analysis for memory extraction.
