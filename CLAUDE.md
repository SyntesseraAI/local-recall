# Local Recall

A local markdown-powered memory system for AI coding assistants. This project enables Claude Code and other AI tools (via MCP) to retain information and context across sessions through structured markdown files.

## Project Overview

Local Recall creates a persistent memory layer that allows multiple AI agents to:
- Store and retrieve contextual information about the codebase
- Share knowledge across different coding sessions
- Maintain project-specific memories that improve over time

All memories are stored locally within the repository, making them version-controllable and shareable among team members.

## Architecture

```
local-recall/
├── src/
│   ├── core/                    # Core memory management
│   │   ├── memory.ts            # CRUD operations for memory files
│   │   ├── index.ts             # Index creation and management
│   │   ├── search.ts            # Fuzzy search implementation
│   │   └── types.ts             # TypeScript interfaces
│   ├── hooks/                   # Claude Code hooks
│   │   ├── session-start.ts     # Load memory index on session start
│   │   └── stop.ts              # Parse transcript and create memories
│   ├── mcp-server/              # MCP server implementation
│   │   ├── server.ts            # Main MCP server
│   │   └── tools.ts             # Exposed memory tools
│   └── utils/                   # Utility functions
│       ├── markdown.ts          # Markdown parsing utilities
│       ├── transcript.ts        # Transcript parsing
│       └── fuzzy.ts             # Fuzzy matching utilities
├── dev-marketplace/             # Claude Code plugin marketplace
│   └── local-recall-plugin/
│       ├── .claude-plugin/
│       │   ├── plugin.json      # Plugin metadata
│       │   └── marketplace.json # Marketplace manifest
│       ├── hooks.json           # Hook configuration (SessionStart, Stop)
│       └── .mcp.json            # MCP server configuration
├── local-recall/                # Memory storage (version-controlled)
│   ├── index.json               # Keyword index cache (gitignored - auto-generated)
│   └── memories/                # Individual memory files (tracked in git)
│       └── *.md                 # Memory markdown files
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Memory File Format

Each memory is stored as a structured markdown file:

```markdown
---
id: unique-memory-id
subject: Brief description of the memory
keywords:
  - keyword1
  - keyword2
  - keyword3
applies_to: global | file:/path/to/file | area:component-name
created_at: ISO-8601 timestamp
updated_at: ISO-8601 timestamp
---

# Content

The actual memory content goes here. This can include:
- Code snippets
- Architectural decisions
- Bug fixes and their reasoning
- User preferences
- Project conventions
```

### Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (UUID) |
| `subject` | Brief one-line description |
| `keywords` | Array of searchable keywords |
| `applies_to` | Scope: `global`, `file:<path>`, or `area:<name>` |
| `created_at` | Creation timestamp |
| `updated_at` | Last modification timestamp |

## Core Components

### Memory Manager (`src/core/memory.ts`)

CRUD operations for memory files:
- `createMemory(data)` - Create a new memory file
- `updateMemory(id, data)` - Update an existing memory
- `deleteMemory(id)` - Delete a memory by ID
- `getMemory(id)` - Retrieve a specific memory
- `listMemories(filter?)` - List all memories with optional filtering

### Index Manager (`src/core/index.ts`)

Maintains a searchable index of all memory keywords:
- `buildIndex()` - Scan all memory files and build keyword index
- `getIndex()` - Retrieve the current index
- `refreshIndex()` - Rebuild the index from scratch

The index is stored at `local-recall/index.json` for fast access.

### Search (`src/core/search.ts`)

Fuzzy search implementation for finding relevant memories:
- `searchByKeywords(query)` - Find memories matching keywords (fuzzy)
- `searchBySubject(query)` - Search by subject line
- `searchByScope(scope)` - Find all memories for a specific scope

## Claude Code Integration

### Hooks

Hooks are configured in `hooks.json` and execute as shell commands that receive JSON via stdin.

#### SessionStart Hook
Triggered when a Claude Code session begins:
1. Receives JSON input with `session_id`, `transcript_path`, `cwd`
2. Loads the memory index from `local-recall/index.json`
3. Retrieves relevant memories based on the current context
4. Outputs memory content to stdout (injected into Claude's context)

#### Stop Hook
Triggered when Claude stops processing:
1. Receives JSON input with `session_id`, `transcript_path`, `cwd`
2. Reads the transcript file (JSONL format)
3. Identifies new messages (within last 30 seconds)
4. Analyzes messages for memory-worthy information
5. Creates memories and refreshes the index

### Plugin Structure

The plugin lives in `dev-marketplace/local-recall-plugin/` and follows Claude Code's plugin format:

```
local-recall-plugin/
├── .claude-plugin/
│   ├── plugin.json       # Plugin metadata (name, version, description)
│   └── marketplace.json  # Marketplace catalog
├── hooks.json            # Hook event handlers
└── .mcp.json             # MCP server configuration
```

### Installing the Plugin

#### Option 1: Via Claude Code Command

```bash
# From Claude Code
/plugin install local-recall@local-recall-marketplace
```

#### Option 2: Manual Configuration

Add to your project's `.claude/settings.json`:

```json
{
  "plugins": {
    "marketplaces": ["./dev-marketplace/local-recall-plugin/.claude-plugin/marketplace.json"],
    "installed": ["local-recall@local-recall-marketplace"]
  }
}
```

#### Option 3: Direct Hooks Configuration

If you prefer not to use the plugin system, add hooks directly to `.claude/settings.json`:

**When local-recall is installed as an npm package:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./node_modules/local-recall/dist/hooks/session-start.js",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./node_modules/local-recall/dist/hooks/stop.js",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

**When running from the local-recall project directory:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./dist/hooks/session-start.js",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./dist/hooks/stop.js",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

## MCP Server

The MCP server exposes memory tools to any MCP-compatible client.

### Adding to Claude Code

Add the MCP server to your Claude Code configuration in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "local-recall": {
      "command": "node",
      "args": ["./node_modules/local-recall/dist/mcp-server/server.js"],
      "env": {
        "LOCAL_RECALL_DIR": "./local-recall"
      }
    }
  }
}
```

Or if running from the local-recall project directory:

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

### Adding to Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "local-recall": {
      "command": "node",
      "args": ["/absolute/path/to/local-recall/dist/mcp-server/server.js"],
      "env": {
        "LOCAL_RECALL_DIR": "/absolute/path/to/your/project/local-recall"
      }
    }
  }
}
```

### Starting the Server Manually

```bash
# From the local-recall project directory
npm run mcp:start

# Or directly
node dist/mcp-server/server.js
```

### Available Tools

| Tool | Description |
|------|-------------|
| `memory_create` | Create a new memory |
| `memory_update` | Update an existing memory |
| `memory_delete` | Delete a memory |
| `memory_search` | Search memories by keywords |
| `memory_list` | List all memories |
| `index_rebuild` | Rebuild the memory index |

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5.9+

### Setup
```bash
npm install
npm run build
```

### Scripts
```bash
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm run test         # Run tests
npm run lint         # Lint code
npm run mcp:start    # Start MCP server
```

### Testing
```bash
npm test                    # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
```

## Configuration

Configuration can be set via environment variables or a `.local-recall.json` file:

```json
{
  "memoryDir": "./local-recall",
  "maxMemories": 1000,
  "indexRefreshInterval": 300,
  "fuzzyThreshold": 0.6
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `memoryDir` | `./local-recall` | Directory for memory storage |
| `maxMemories` | `1000` | Maximum number of memories |
| `indexRefreshInterval` | `300` | Seconds between index refreshes |
| `fuzzyThreshold` | `0.6` | Minimum fuzzy match score (0-1) |

## Contributing

1. All memory files use YAML frontmatter for metadata
2. Keep memories atomic - one concept per memory
3. Use specific keywords for better searchability
4. Test hooks locally before committing

## Notes for AI Assistants

When working with this codebase:
- Memory files are markdown with YAML frontmatter
- Memory files ARE version-controlled - they will be committed to git
- The index (`local-recall/index.json`) is gitignored and auto-generated
- Use the provided tools rather than direct file manipulation
- New memories should have relevant, specific keywords
- Consider scope carefully: `global` vs `file:` vs `area:`

### Development Requirements

**ALWAYS create comprehensive tests and documentation:**
- All new features must have corresponding unit tests in `tests/unit/`
- Integration tests go in `tests/integration/`
- Documentation must be placed in the `docs/` folder
- Update existing docs when modifying functionality
- Tests should cover both happy paths and edge cases
