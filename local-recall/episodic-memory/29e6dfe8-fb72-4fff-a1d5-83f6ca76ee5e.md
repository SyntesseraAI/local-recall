---
id: 29e6dfe8-fb72-4fff-a1d5-83f6ca76ee5e
subject: Plugin installation and build process for local-recall
keywords:
  - plugin
  - installation
  - build
  - claude-code
  - setup
applies_to: global
occurred_at: '2025-12-02T06:24:56.200Z'
content_hash: 23f08ed634bf9ad9
---
## Installation Process
Local Recall can be installed as a Claude Code plugin using the `/plugin` command. After installation:

1. Run `npm run build` to compile TypeScript and create bundled scripts
2. The plugin is installed and Claude Code must be restarted to load it
3. The built scripts in `scripts/` directory are what Claude Code executes

## Build Output
The build process generates:
- `scripts/hooks/session-start.js` - bundled SessionStart hook
- `scripts/hooks/user-prompt-submit.js` - bundled UserPromptSubmit hook
- `scripts/hooks/stop.js` - bundled Stop hook
- `scripts/mcp-server/server.js` - bundled MCP server

These are the actual files executed by Claude Code hooks, not the TypeScript source files.
