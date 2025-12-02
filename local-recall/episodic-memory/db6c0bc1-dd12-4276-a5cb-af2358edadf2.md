---
id: db6c0bc1-dd12-4276-a5cb-af2358edadf2
subject: >-
  SessionStart hook receives cwd but UserPromptSubmit hook output is read by
  session-start hook
keywords:
  - hooks
  - sessionstart
  - userpromptsubmit
  - cwd
  - transcript-path
  - output-handling
  - hook-lifecycle
applies_to: global
occurred_at: '2025-12-01T16:15:49.100Z'
content_hash: 6c6daab5c63d1ce9
---
# Claude Code Hook Input/Output Behavior

## Hook Invocation Context

Both SessionStart and UserPromptSubmit hooks receive JSON input via stdin containing:
- `session_id`: Unique session identifier
- `transcript_path`: Path to current session transcript
- `cwd`: Current working directory where Claude Code is running

## Critical Discovery

The **SessionStart hook output is read by the SessionStart hook itself** - meaning:
- When a hook outputs text to stdout, it gets captured
- The session-start hook processes its own output
- This creates a potential loop if not handled carefully

## Implementation Implications

- The user-prompt-submit hook output should be properly integrated with session-start behavior
- Must carefully manage what gets written to stdout to avoid circular processing
- Document expected output format for each hook type
- SessionStart should only process valid memory content from its own operations
