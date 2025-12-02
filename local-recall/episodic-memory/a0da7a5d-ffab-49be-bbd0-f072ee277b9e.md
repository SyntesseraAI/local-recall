---
id: a0da7a5d-ffab-49be-bbd0-f072ee277b9e
subject: 'Plugin root structure uses ${CLAUDE_PLUGIN_ROOT} for hook script references'
keywords:
  - plugin
  - hooks
  - claude-plugin
  - script paths
  - installation
applies_to: global
occurred_at: '2025-12-01T15:55:34.707Z'
content_hash: 99d67e58954a1803
---
## Plugin Installation and Hook Configuration

Local Recall is a Claude Code plugin with special path handling:

### Directory Structure

- Project root is the plugin root
- Compiled scripts are in `scripts/` (gitignored, build output)
- Hooks reference scripts using `${CLAUDE_PLUGIN_ROOT}` variable

### Two Installation Methods

**Option 1: As plugin**
- Add to `.claude/settings.json` plugins array
- Hooks use `${CLAUDE_PLUGIN_ROOT}` for path resolution
- Plugin handles compilation automatically

**Option 2: Direct hook configuration**
- Add hooks directly to `.claude/settings.json`
- Use absolute paths or relative paths from project root
- Can install as npm package with `./node_modules/local-recall/scripts/`

### Important Notes

- Hooks receive `cwd` via stdin to operate on user's project directory
- Both SessionStart and UserPromptSubmit hooks run with timeout: 30 seconds
- Stop hook timeout is 60 seconds (currently disabled)
