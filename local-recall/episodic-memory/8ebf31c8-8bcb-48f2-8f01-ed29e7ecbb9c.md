---
id: 8ebf31c8-8bcb-48f2-8f01-ed29e7ecbb9c
subject: >-
  Memory extraction guidelines prioritize actionable, specific, and
  codebase-specific information
keywords:
  - memory guidelines
  - extraction criteria
  - actionable memories
  - specificity
  - scope selection
applies_to: global
occurred_at: '2025-12-01T15:52:55.982Z'
content_hash: f2f1d066bcd17ae2
---
When extracting memories from transcripts:

**DO extract:**
- Architectural decisions and reasoning
- Bug fixes with root cause analysis
- Code patterns specific to the project
- Configuration quirks or gotchas
- User preferences discovered
- Component relationships
- Performance optimizations

**DO NOT extract:**
- Generic programming knowledge
- Temporary debugging steps
- Trivial/obvious information
- Sensitive data (API keys, passwords)
- Quickly outdated information

Use appropriate scope: `global` for codebase-wide knowledge, `file:<path>` for file-specific details, `area:<name>` for component-related memories.
