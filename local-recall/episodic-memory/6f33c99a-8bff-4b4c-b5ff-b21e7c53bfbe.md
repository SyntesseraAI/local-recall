---
id: 6f33c99a-8bff-4b4c-b5ff-b21e7c53bfbe
subject: Transcript condensing produces structured event format for memory extraction
keywords:
  - transcript condensing
  - event format
  - structured transcript
  - user events
  - tool events
applies_to: global
occurred_at: '2025-12-01T16:29:02.503Z'
content_hash: 8a7cfe47f9cd1aaf
---
Transcripts are condensed into a structured event format before being passed to the memory extraction system. The format includes:
- `[User]` - What the user asked or requested
- `[Assistant]` - What Claude said or explained
- `[Tool: Name]` - Tool invocations (Read, Edit, Write, Bash, Grep, etc.)
- `[Result: OK/ERROR]` - Outcome of tool invocations

This condensed format makes it easier for the memory extraction system to parse and understand the session flow without processing raw transcript data.
