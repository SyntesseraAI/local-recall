---
id: 5cd2f0ba-7b40-45da-9175-fff2ef5b2ccc
subject: >-
  I see from the reference documentation that: 1. Default directories are
  scanned automatically:...
applies_to: global
occurred_at: '2025-12-16T12:09:09.320Z'
content_hash: f07b5ec7cfcb528d
---
## Thought

I see from the reference documentation that:
1. Default directories are scanned automatically: `./commands/`, `./agents/`, `./skills/`, `./hooks/hooks.json`, `./.mcp.json`
2. The `skills` directory is discovered automatically - no explicit field needed in plugin.json

So the skills directory I created should be auto-discovered! But let me also verify by looking at what fields are available in the manifest reference. It looks like skills don't need to be specified in plugin.json since they're auto-discovered from `./skills/`.

Let me update the plugin.json with a better description and add keywords that will help with discovery, but I don't need to add a skills field.

## Output

Good news - the documentation shows that `./skills/` directory is auto-discovered by Claude Code, so no manifest changes needed. But let me improve the plugin description and keywords for better discoverability.
