---
id: adfe9bdc-0a21-4a8f-a4c1-6ec5d6be5fa9
subject: >-
  The user is asking if I can use a GitHub MCP server to see an inline
  suggestion from a PR. However,...
applies_to: global
occurred_at: '2025-11-29T18:54:47.599Z'
content_hash: cd9fcd23fa9e8fa4
---
## Thought

The user is asking if I can use a GitHub MCP server to see an inline suggestion from a PR. However, I don't have any GitHub MCP server configured in my available tools. Let me check what tools I have available.

Looking at my available tools, I have:
- Task
- Bash
- Glob
- Grep
- Read
- ExitPlanMode
- Edit
- Write
- NotebookEdit
- WebFetch
- TodoWrite
- WebSearch
- BashOutput
- KillShell
- Skill
- SlashCommand
- EnterPlanMode

I don't see any MCP tools available that start with "mcp__" which would indicate that an MCP server is configured and connected. The user would need to have a GitHub MCP server configured in their Claude Code settings for me to be able to access it.

I should let them know that I don't currently have access to a GitHub MCP server, and explain how they could set one up if they want that functionality.

## Output

I don't currently have access to a GitHub MCP server - I can only see the tools that are available in my environment, and there's no GitHub MCP server configured.

To use a GitHub MCP server with Claude Code, you would need to:

1. **Install a GitHub MCP server** (like the official one from Anthropic or a community version)

2. **Configure it in your `.claude/settings.json`**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

Once configured and the session is restarted, I would have access to tools like `mcp__github__create_or_update_file`, `mcp__github__search_code`, `mcp__github__get_file_contents`, etc.

However, for inline Copilot suggestions in your IDE, those are typically only visible within your IDE itself and not accessible through any MCP server or API - they're ephemeral suggestions shown in your editor.

Are you perhaps looking at a PR review comment or suggestion that was created by Copilot? If so, I could help you check the PR using the `gh` command via Bash if you provide the PR number.
