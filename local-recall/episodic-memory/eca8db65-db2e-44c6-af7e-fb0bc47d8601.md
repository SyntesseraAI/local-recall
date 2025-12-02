---
id: eca8db65-db2e-44c6-af7e-fb0bc47d8601
subject: Transcript condensing for memory extraction is a core feature
keywords:
  - transcript-condensing
  - memory-extraction
  - efficiency
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-02T07:48:46.277Z'
content_hash: 68dc21b4db1db16f
---
Transcript condensing is the primary mechanism for preparing transcripts for memory extraction:

- Converts full transcripts into condensed format with event markers
- Events include: `[User]`, `[Assistant]`, `[Tool: Name]`, `[Result: OK/ERROR]`
- Reduces context size while preserving essential information
- Enables efficient processing by Claude Haiku for memory extraction

This approach balances the need for detailed context with token efficiency when extracting memories from session transcripts.
