---
id: f3f76e5f-2eac-4ac6-bd51-f0bac6d6d627
subject: Memory extractor module handles transcript condensing and memory extraction
keywords:
  - memory-extractor
  - transcript
  - condensing
  - extraction
  - claude-api
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T15:58:35.858Z'
content_hash: a551dfd32e28fbf1
---
The memory-extractor.ts module is responsible for:

1. **Transcript Condensing**: Takes raw Claude transcripts and condenses them into a structured event format with [User], [Assistant], [Tool: Name], and [Result: OK/ERROR] entries
2. **Memory Extraction**: Uses Claude API (Haiku model via claude -p) to analyze condensed transcripts and extract valuable memories
3. **Key Functions**:
   - `condenseTranscript()` - Processes raw transcripts into condensed event format
   - `extractMemories()` - Calls Claude to analyze transcripts and generate memories
   - Uses streaming output for real-time processing

The module integrates with the memory creation system to store extracted memories with proper metadata (keywords, scope, occurred_at, content_hash).
