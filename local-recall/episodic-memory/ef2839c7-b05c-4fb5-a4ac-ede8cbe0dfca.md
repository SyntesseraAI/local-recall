---
id: ef2839c7-b05c-4fb5-a4ac-ede8cbe0dfca
subject: Session-start hook receives JSON input with session metadata
keywords:
  - session-start
  - hook input
  - session_id
  - transcript_path
  - cwd
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-02T06:33:43.913Z'
content_hash: 82669bc03996e304
---
The session-start hook receives JSON input via stdin containing:
- `session_id`: Unique identifier for the session
- `transcript_path`: Path to the transcript file
- `cwd`: Current working directory of the project

This input is used to load the memory index and retrieve relevant memories for context injection.
