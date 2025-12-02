---
id: f69cce4d-eb83-4cf3-b65e-15e6fa965bbd
subject: >-
  UserPromptSubmit hook infinite recursion when calling claude -p without
  disabling hooks
keywords:
  - userpromptsubmit
  - hook
  - claude -p
  - recursion
  - abort error
  - child process
applies_to: 'file:src/hooks/user-prompt-submit.ts'
occurred_at: '2025-12-02T02:15:09.189Z'
content_hash: 33f0c9a168c781ae
---
When the UserPromptSubmit hook calls `claude -p` to extract keywords from user prompts, it triggers the UserPromptSubmit hook again, causing infinite recursion. This results in an 'Abort called' error from child processes. The solution is to disable hooks when invoking `claude -p` by using the `--no-hooks` flag (e.g., `claude -p --model haiku --no-hooks`).
