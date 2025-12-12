---
id: 97da6b03-cfbe-4235-bcc1-edad70adaa23
subject: >-
  The bundled server now starts successfully. Now the user needs to: 1. Update
  the plugin in the...
applies_to: global
occurred_at: '2025-12-12T10:11:43.803Z'
content_hash: ed0551461754a32b
---
## Thought

The bundled server now starts successfully. Now the user needs to:

1. Update the plugin in the cache (or reinstall)
2. Restart Claude Code

Let me tell them how to do this.

## Output

The bundled server now works. To fix your other Claude instances:

**Option 1: Update the plugin cache manually**
```bash
cp dev-marketplace/local-recall-plugin/scripts/mcp-server/server.js \
   ~/.claude/plugins/cache/local-recall-marketplace/local-recall/0.1.0/scripts/mcp-server/
```

**Option 2: Reinstall the plugin**
Uninstall and reinstall local-recall via Claude's plugin system.

After either option, **restart Claude Code** in the affected instances.

The root cause was `--external:@modelcontextprotocol/sdk` in the build script, which told esbuild not to bundle the MCP SDK. The plugin system doesn't ship node_modules, so the import failed. Now all dependencies are bundled into the single server.js file.
