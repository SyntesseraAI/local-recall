---
id: ec9aee6f-ac3a-4dda-bdf1-56273b8f98b7
subject: >-
  SessionStart and UserPromptSubmit hooks execute but return empty stdout in
  user environments
keywords:
  - hooks
  - debugging
  - stdout
  - empty response
  - claude code
  - troubleshooting
applies_to: global
occurred_at: '2025-12-21T19:02:46.136Z'
content_hash: 644f68ba966bd31e
---
Hooks (SessionStart and UserPromptSubmit) are executing in Claude Code but not returning any stdout, even though manual testing shows they work correctly. This affects memory injection into prompts. The issue appears to be environment-specific rather than a code problem, as hooks execute successfully when tested manually but produce empty output in user workflows. Need to investigate stderr redirection, environment variables, or process handling in hook execution context.
