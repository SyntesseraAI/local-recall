---
id: 88e0dee9-fcad-48eb-95fb-32706c7ffe5b
subject: 'Plugin deployment issue: unbundled dependencies cause MCP server failures'
keywords:
  - plugin
  - mcp-server
  - deployment
  - bundling
  - dependencies
  - node_modules
applies_to: global
occurred_at: '2025-12-12T10:19:41.481Z'
content_hash: 4d2bfd7851475c88
---
The local-recall plugin deploys to `~/.claude/plugins/cache/local-recall-marketplace/local-recall/[VERSION]/scripts/mcp-server/server.js` but fails when other Claude instances try to run it because node_modules aren't shipped with plugins. The solution is to ensure the build script bundles all dependencies into server.js (remove `--external` flag from esbuild config). When plugin cache becomes outdated, users must uninstall and reinstall the plugin to force a fresh deployment.
