---
id: 272bcdad-93d8-45f1-a72d-cdc6e4f3ad8e
subject: Local Recall project structure and key directories
keywords:
  - local-recall
  - architecture
  - directory-structure
  - project-layout
  - plugin
applies_to: global
occurred_at: '2025-12-01T15:59:01.712Z'
content_hash: 85f8ebf3ad7bf53d
---
# Local Recall Project Structure

The local-recall project follows a plugin-based architecture:

## Key Directories

- `src/` - TypeScript source code
  - `core/` - Core memory management (memory.ts, index.ts, search.ts)
  - `hooks/` - Claude Code hooks (session-start, user-prompt-submit, stop)
  - `mcp-server/` - MCP server implementation
  - `utils/` - Utilities (markdown, transcript parsing, logging, fuzzy matching)
- `local-recall/` - Memory storage directory
  - `episodic-memory/` - Individual memory markdown files
  - `index.json` - Keyword index cache (gitignored)
  - `recall.log` - Debug log (gitignored)
- `scripts/` - Built/bundled JavaScript (build output, gitignored)
- `.claude-plugin/` - Plugin metadata

## Important Notes

- The project root IS the plugin root
- Memory files in `episodic-memory/` are version-controlled (committed to git)
- The index and logs are gitignored and auto-generated
- Hooks use `${CLAUDE_PLUGIN_ROOT}` to reference bundled scripts
- All hook configurations receive `cwd` via stdin to operate on user's project
