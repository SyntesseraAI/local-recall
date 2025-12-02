---
id: bed9f7de-bbcc-4aba-91cb-11fd6ae7f0e0
subject: Hook execution receives cwd via stdin to work on user's project directory
keywords:
  - hooks
  - stdin
  - cwd
  - json input
  - plugin architecture
applies_to: 'file:src/hooks/session-start.ts'
occurred_at: '2025-12-02T01:05:11.943Z'
content_hash: 5f1be41e6858f44a
---
Claude Code hooks receive JSON input via stdin that includes `cwd` parameter. This allows hooks to operate on the user's project directory rather than the plugin directory. The `${CLAUDE_PLUGIN_ROOT}` environment variable references the plugin location. Hooks must handle both cases: running from plugin root and running from npm package node_modules.
