# Local Recall

A local markdown-powered memory system that helps AI coding assistants retain information and context across sessions.

## Features

- **Persistent Memory**: Store contextual information in structured markdown files
- **Semantic Search**: Find relevant memories using vector embeddings (Ollama + nomic-embed-text)
- **Episodic Memories**: Facts, decisions, and patterns extracted from conversations
- **Thinking Memories**: Claude's previous reasoning paired with outputs for better context
- **Multi-Agent Support**: Multiple AI agents can read/write to the shared memory
- **Claude Code Integration**: Hooks for automatic memory capture and retrieval
- **MCP Server**: Expose memory tools to any MCP-compatible client

## Quick Start

### Prerequisites

1. **Node.js 18+**
2. **Ollama** for embeddings:
   ```bash
   # Install Ollama (macOS)
   brew install ollama

   # Pull the embedding model
   ollama pull nomic-embed-text

   # Start Ollama server
   ollama serve
   ```

### Installation

```bash
# Clone the repository
git clone https://github.com/syntessera/local-recall.git
cd local-recall

# Install dependencies
npm install

# Build the project
npm run build
```

### Claude Code Plugin (Recommended)

Install the plugin from `local-recall-plugin/` (or via the Claude marketplace at `syntessera-marketplace/local-recall`) to enable automatic memory integration:

- **SessionStart Hook**: Loads recent memories when starting a session
- **UserPromptSubmit Hook**: Searches for relevant episodic and thinking memories based on your prompt

## How It Works

Local Recall stores memories as markdown files with YAML frontmatter containing metadata like subject, keywords, and scope. Memories are indexed using Orama (pure JavaScript) with vector embeddings from Ollama for semantic similarity search.

### Memory Types

**Episodic Memories** - Facts, decisions, and patterns:
```markdown
---
id: abc123-...
subject: API authentication pattern
keywords: [auth, jwt, tokens, api]
applies_to: global
occurred_at: 2025-01-15T10:30:00Z
content_hash: a1b2c3d4...
---

The API uses JWT tokens for authentication...
```

**Thinking Memories** - Claude's reasoning paired with outputs:
```markdown
---
id: def456-...
subject: Auto-generated from thinking content...
applies_to: global
occurred_at: 2025-01-15T10:30:00Z
content_hash: e5f6g7h8...
---

## Thought

[Claude's internal reasoning]

## Output

[The response that followed]
```

## MCP Server

The MCP server exposes memory tools and runs a background daemon for transcript processing.

### Starting the Server

```bash
npm run mcp:start
```

### Available Tools

| Tool | Description |
|------|-------------|
| `episodic_create` | Create a new episodic memory |
| `episodic_get` | Retrieve a specific episodic memory by ID |
| `episodic_search` | Search episodic memories using semantic similarity |
| `thinking_get` | Retrieve a specific thinking memory by ID |
| `thinking_search` | Search thinking memories using semantic similarity |

### Adding to Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "local-recall": {
      "command": "node",
      "args": ["./dist/mcp-server/server.js"],
      "env": {
        "LOCAL_RECALL_DIR": "./local-recall"
      }
    }
  }
}
```

## Configuration

Create `.local-recall.json` in your project root:

```json
{
  "memoryDir": "./local-recall",
  "episodicEnabled": true,
  "episodicMaxTokens": 1000,
  "episodicMinSimilarity": 0.5,
  "thinkingEnabled": true,
  "thinkingMaxTokens": 1000,
  "thinkingMinSimilarity": 0.5
}
```

Or use environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCAL_RECALL_DIR` | `./local-recall` | Memory storage directory |
| `LOCAL_RECALL_EPISODIC_ENABLED` | `true` | Enable episodic memory retrieval |
| `LOCAL_RECALL_THINKING_ENABLED` | `true` | Enable thinking memory retrieval |
| `LOCAL_RECALL_LOG_LEVEL` | `error` | Log level: debug, info, warn, error |

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Architecture](./docs/architecture.md) - System design and components
- [Memory Format](./docs/memory-format.md) - Memory file structure
- [Thinking Memories](./docs/thinking-memory.md) - How thinking memories work
- [Claude Code Hooks](./docs/hooks.md) - Hook configuration and usage
- [MCP Server](./docs/mcp-server.md) - MCP tools and daemon processing
- [Configuration](./docs/configuration.md) - All configuration options

## Development

```bash
npm run dev          # Watch mode
npm run test         # Run tests
npm run lint         # Lint code
```

## License

MIT
