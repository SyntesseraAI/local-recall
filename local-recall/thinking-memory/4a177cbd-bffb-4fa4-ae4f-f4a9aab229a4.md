---
id: 4a177cbd-bffb-4fa4-ae4f-f4a9aab229a4
subject: >-
  This is very helpful! The agent is saying that all files in the plugin source
  directory should be...
applies_to: global
occurred_at: '2025-12-20T18:51:54.376Z'
content_hash: 33372ee312358e0e
---
## Thought

This is very helpful! The agent is saying that all files in the plugin source directory should be copied to cache when installed. But in our case, the `scripts/` directory is NOT being copied. Let me verify the issue more carefully:

1. The local `local-recall-plugin/` has `scripts/mcp-server/server.js`
2. The cached version at `~/.claude/plugins/cache/syntesseraai-local-recall/local-recall/0.1.3/` does NOT have `scripts/`

This suggests either:
1. The marketplace fetch mechanism isn't working correctly
2. The plugin was published/registered incorrectly
3. There's a Git/repo issue where scripts aren't being included

Let me check if this is a GitHub-based plugin and how it's being fetched:

## Output

Interesting! The agent says all files should be copied, but they're not. Let me check if this is a Git-based fetch issue:
