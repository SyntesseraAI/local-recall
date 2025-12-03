---
id: e873e2ee-c94a-4cc3-bcf8-a8b6affde2ec
subject: >-
  I see - in `runTranscriptProcessing`, when `projectPath` is not provided, it
  defaults to...
applies_to: global
occurred_at: '2025-11-30T14:48:17.345Z'
content_hash: 01822f236425d55e
---
## Thought

I see - in `runTranscriptProcessing`, when `projectPath` is not provided, it defaults to `process.cwd()` in the `MemoryExtractor` constructor. The problem is the MCP server doesn't pass a `projectPath`, so it uses `process.cwd()`.

But wait - the MCP server runs from a different cwd than the project directory. The MCP server is started by Claude Code and might run from a different directory.

Looking at the log output the user provided, I can see:
- The `cwd` in the hook input is `/Users/joe/Code/Syntessera/local-recall`
- But the MCP server might be running from a different directory

The issue is that `process.cwd()` might not be the project directory when the MCP server runs. Let me check where the MCP server gets its project path from.

Looking at the config loading, I need to see what `getConfig()` returns and whether it has a project path. Let me check the config utility.

Actually, the problem is likely that the MCP server doesn't know the project path. The MCP server is started by Claude Code with environment variables. Let me check if there's an environment variable for the local recall directory or project path.

Looking at the CLAUDE.md, I see:
```json
{
  "mcpServers": {
    "local-recall": {
      "command": "node",
      "args": ["./scripts/mcp-server/server.js"],
      "env": {
        "LOCAL_RECALL_DIR": "./local-recall"
      }
    }
  }
}
```

So there's a `LOCAL_RECALL_DIR` env var, but that's for the memory directory, not the project path. The MCP server needs to know the project path to find the Claude project folder.

Let me check the config utility to see how it resolves paths.

## Output

I see the issue. The MCP server uses `process.cwd()` as the default project path, but the MCP server might be running from a different directory than the project. Let me check how the config handles paths:
