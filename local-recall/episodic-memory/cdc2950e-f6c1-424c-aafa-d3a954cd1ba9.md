---
id: cdc2950e-f6c1-424c-aafa-d3a954cd1ba9
subject: Hook architecture receives JSON input and outputs memory content via stdout
keywords:
  - hooks
  - claude code
  - json input
  - stdout output
  - session start
  - user prompt submit
applies_to: global
occurred_at: '2025-12-21T19:17:45.599Z'
content_hash: eeddbc5306537de4
---
Claude Code hooks (SessionStart, UserPromptSubmit) are configured as shell commands that receive JSON input via stdin containing session_id, transcript_path, and cwd. Hooks search memories using Orama and output results to stdout, which are automatically injected into Claude's context. The UserPromptSubmit hook is unified to handle both episodic and thinking memories based on configuration.
