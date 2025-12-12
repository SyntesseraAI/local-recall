---
id: 94a9decf-5ed1-4fbe-996a-9da9b1bf5c10
subject: >-
  Interesting! I can see: 1. The transcript discovery IS running (it's logging
  at DEBUG level, not...
applies_to: global
occurred_at: '2025-12-12T10:09:48.973Z'
content_hash: 9de84ebf557a76bb
---
## Thought

Interesting! I can see:
1. The transcript discovery IS running (it's logging at DEBUG level, not INFO level as I added)
2. There are DUPLICATE log entries - each log line appears twice
3. It's finding 35,201+ transcripts

The duplicate log entries suggest that there might be two MCP server instances running for the same project, OR there's a bug in the logging where it's being called twice.

Also, I notice the logging is at DEBUG level, not INFO level. Let me check if the INFO-level logging I thought was added is actually in the codebase. The user mentioned they're not seeing `[transcript]` logs in OTHER projects - so the question is whether those other projects have the MCP server running at all.

Let me check the transcript-collector.ts to see the current logging levels.

## Output

Interesting! I see two things:

1. **Duplicate log entries** - Each line appears twice, which suggests either two MCP servers running for this project OR a logging bug
2. **Logging is at DEBUG level** - The transcript discovery logs are `[DEBUG]`, not `[INFO]`

Let me check if the INFO-level logging was added:
