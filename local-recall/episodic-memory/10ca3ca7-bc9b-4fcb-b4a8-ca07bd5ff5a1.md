---
id: 10ca3ca7-bc9b-4fcb-b4a8-ca07bd5ff5a1
subject: >-
  Transcript analysis follows structured format with events: User, Assistant,
  Tool, Result
keywords:
  - transcript-format
  - events
  - user-prompt
  - tool-invocation
  - structured-data
applies_to: global
occurred_at: '2025-12-01T21:58:14.617Z'
content_hash: e106c424248ac178
---
Transcripts are analyzed as a sequence of structured events:
- `[User]` - User requests or questions
- `[Assistant]` - Claude's responses and explanations
- `[Tool: Name]` - Tool invocations (Read, Edit, Write, Bash, etc.)
- `[Result: OK/ERROR]` - Outcome of tool execution

This structured format allows the memory extractor to understand what happened during a session and extract meaningful memories about discoveries and solutions.
