---
id: 8c4bc042-baef-4b05-8ba9-16dd2cc2bdf5
subject: >-
  Transcript condensing reduces token usage in memory extraction by summarizing
  dialogue
keywords:
  - transcript
  - condensing
  - memory extraction
  - token optimization
  - performance
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T22:27:59.401Z'
content_hash: 798c7867fdc6d3e3
---
Transcript condensing is implemented to reduce token consumption when extracting memories from Claude Code transcripts. Instead of sending the full transcript to Claude for analysis, the system first condenses it by:

1. Extracting only assistant responses and tool results
2. Summarizing user prompts and tool outputs
3. Creating a compact representation that preserves essential information

This significantly reduces the number of tokens sent to Claude's memory extraction pipeline while maintaining the ability to identify valuable memories. The condensing happens before calling `claude -p` with the transcript data.
