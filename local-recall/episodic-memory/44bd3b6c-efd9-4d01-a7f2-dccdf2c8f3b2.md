---
id: 44bd3b6c-efd9-4d01-a7f2-dccdf2c8f3b2
subject: MCP server exposes memory tools for Claude Code and Claude Desktop integration
keywords:
  - mcp-server
  - tools
  - integration
  - claude-code
  - claude-desktop
applies_to: global
occurred_at: '2025-12-21T18:30:59.171Z'
content_hash: 9c5b4862907cc3da
---
The MCP server provides tool interfaces for memory operations. Configuration varies depending on installation context:
- As npm package: uses `./node_modules/local-recall/dist/` paths
- From project directory: uses local `./dist/` paths
Both require `LOCAL_RECALL_DIR` environment variable to locate memory storage.
