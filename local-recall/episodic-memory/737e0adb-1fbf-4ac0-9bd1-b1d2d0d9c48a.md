---
id: 737e0adb-1fbf-4ac0-9bd1-b1d2d0d9c48a
subject: Project structure follows Claude Code plugin format with hooks and MCP server
keywords:
  - plugin-structure
  - hooks
  - mcp-server
  - architecture
  - file-layout
applies_to: global
occurred_at: '2025-12-02T11:40:01.751Z'
content_hash: c36ee73b1f1c9d6f
---
Local Recall is organized as:
- `.claude-plugin/plugin.json` - Plugin metadata
- `hooks.json` - Hook configuration (SessionStart, UserPromptSubmit, Stop)
- `.mcp.json` - MCP server configuration
- `scripts/` - Bundled executables (build output, gitignored)
- `src/` - TypeScript source code
- `local-recall/` - Memory storage (version-controlled with gitignored index and logs)

Hooks use `${CLAUDE_PLUGIN_ROOT}` to reference scripts relative to plugin installation.
