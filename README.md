# Local Recall

A local markdown-powered memory system that helps AI coding assistants retain information and context across sessions.

## Features

- **Persistent Memory**: Store contextual information in structured markdown files
- **Keyword Indexing**: Fast lookup through keyword-based indexing
- **Fuzzy Search**: Find related memories even with imprecise queries
- **Multi-Agent Support**: Multiple AI agents can read/write to the shared memory
- **Claude Code Integration**: Hooks for automatic memory capture and retrieval
- **MCP Server**: Expose memory tools to any MCP-compatible client

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
npm run mcp:start
```

## How It Works

Local Recall stores memories as markdown files with YAML frontmatter containing metadata like keywords, subject, and scope. An index is maintained for fast keyword-based lookups with fuzzy matching support.

### Memory Structure

```markdown
---
id: abc123
subject: API authentication pattern
keywords: [auth, jwt, tokens, api]
applies_to: global
---

# Content

The API uses JWT tokens for authentication...
```

## Claude Code Integration

Install the plugin from `dev-marketplace/local-recall-plugin/` to enable:

- **SessionStart Hook**: Automatically loads relevant memories when starting a session
- **Stop Hook**: Captures new information from conversations to create memories

## MCP Server

Start the MCP server to expose memory tools:

```bash
npm run mcp:start
```

Available tools:
- `memory_create` - Create a new memory
- `memory_update` - Update an existing memory
- `memory_delete` - Delete a memory
- `memory_search` - Search memories by keywords
- `memory_list` - List all memories
- `index_rebuild` - Rebuild the memory index

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Architecture](./docs/architecture.md)
- [Memory Format](./docs/memory-format.md)
- [Claude Code Hooks](./docs/hooks.md)
- [MCP Server](./docs/mcp-server.md)
- [Configuration](./docs/configuration.md)

## Development

```bash
npm run dev          # Watch mode
npm run test         # Run tests
npm run lint         # Lint code
```

## License

MIT
