---
id: 7714c00c-ef9e-4dad-ae1f-d0e8b8c7ebcb
subject: Plugin installation options via npm or direct hooks configuration
keywords:
  - installation
  - plugin
  - npm-package
  - hooks-config
  - claude-settings
applies_to: global
occurred_at: '2025-12-02T11:47:07.978Z'
content_hash: e73ded2061c4531e
---
Two installation approaches:

1. **Plugin format**: Clone repo, build, add to .claude/settings.json plugins array with plugin path

2. **Direct hooks**: If installed as npm package or running locally, add hooks directly to .claude/settings.json with command paths. Use ./node_modules/local-recall/scripts/... for npm package or ./scripts/... for local project directory.

MCP server can also be configured in mcpServers section with LOCAL_RECALL_DIR environment variable pointing to memory directory.
