---
id: 827e37fe-cfed-4276-9baa-9a8acc9fbc28
subject: Thinking blocks in transcripts are identified by type='thinking' in content
keywords:
  - thinking blocks
  - transcript structure
  - content type
  - detection
applies_to: global
occurred_at: '2025-12-21T18:15:34.664Z'
content_hash: 468db32e8ab7713b
---
Thinking blocks appear in Claude's transcripts as content elements with `"type":"thinking"`. This is how the codebase identifies and extracts Claude's reasoning from transcripts.

Used in:
- `thinking-extractor.ts` for extracting thinking blocks
- `transcript-collector.ts` for filtering transcripts during sync

This is the standard way to detect whether a transcript contains thinking (and thus is worth processing for thinking memories).
