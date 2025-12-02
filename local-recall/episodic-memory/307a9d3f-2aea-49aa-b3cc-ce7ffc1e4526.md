---
id: 307a9d3f-2aea-49aa-b3cc-ce7ffc1e4526
subject: >-
  Memory extraction filters out generic programming knowledge, temporary
  debugging, and trivial information
keywords:
  - memory-extraction
  - filtering-rules
  - knowledge-filtering
applies_to: global
occurred_at: '2025-12-02T07:27:17.797Z'
content_hash: d0f0adb4aeca6199
---
When extracting memories from session transcripts, the system explicitly avoids:
- Generic programming knowledge (Claude already knows this)
- Temporary debugging steps that aren't useful long-term
- Obvious or trivial information
- Sensitive data (API keys, passwords, personal info)
- Information that would become outdated quickly

This ensures the memory system focuses on actionable, codebase-specific insights that will genuinely help future AI assistants.
