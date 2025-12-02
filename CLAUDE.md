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
local-recall/                    # Project root
├── src/
│   ├── core/                    # Core memory management
│   │   ├── memory.ts            # CRUD operations for memory files
│   │   ├── vector-store.ts      # SQLite + vector embeddings for semantic search
│   │   ├── embedding.ts         # Embedding service (fastembed)
│   │   ├── search.ts            # Search implementation using vector store
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── transcript-collector.ts  # Collect transcripts from Claude cache
│   │   ├── transcript-condenser.ts  # Condense transcripts for processing
│   │   ├── memory-extractor.ts  # Extract memories from transcripts
│   │   ├── processed-log.ts     # Track processed transcripts
│   │   ├── thinking-memory.ts   # CRUD for thinking memories (experimental)
│   │   ├── thinking-vector-store.ts # Vector store for thinking memories
│   │   ├── thinking-extractor.ts # Extract thinking blocks (20 parallel)
│   │   ├── thinking-processed-log.ts # Track thinking extraction
│   │   └── thinking-search.ts   # Search thinking memories
│   ├── hooks/                   # Claude Code hooks (source)
│   │   ├── session-start.ts     # Load recent memories on session start
│   │   ├── user-prompt-submit.ts # Semantic search on user prompt
│   │   ├── user-prompt-submit-thinking.ts # Inject thinking memories
│   │   └── stop.ts              # Parse transcript and create memories
│   ├── mcp-server/              # MCP server implementation
│   │   ├── server.ts            # Main MCP server
│   │   └── tools.ts             # Exposed memory tools
│   ├── prompts/                 # Prompt templates
│   │   └── memory-extraction.ts # Memory extraction prompts
│   ├── types/                   # Type definitions
│   │   ├── transcript-schema.ts # Transcript JSON schema
│   │   └── rake-pos.d.ts        # Type declarations
│   └── utils/                   # Utility functions
│       ├── markdown.ts          # Markdown parsing utilities
│       ├── transcript.ts        # Transcript parsing
│       ├── logger.ts            # Logging utility (writes to recall.log)
│       ├── fuzzy.ts             # Fuzzy matching utilities
│       ├── config.ts            # Configuration loading
│       ├── gitignore.ts         # Gitignore management
│       └── summarize.ts         # Text summarization utilities
├── dist/                        # Build output (gitignored)
│   ├── hooks/                   # Compiled hooks
│   ├── mcp-server/              # Compiled MCP server
│   └── ...
├── local-recall/                # Memory storage (version-controlled)
│   ├── .gitignore               # Auto-generated, excludes memory.sqlite and recall.log
│   ├── memory.sqlite            # SQLite database with vector embeddings (gitignored)
│   ├── recall.log               # Debug log file (gitignored)
│   ├── episodic-memory/         # Individual memory files (tracked in git)
│   │   └── *.md                 # Memory markdown files
│   └── thinking-memories/       # Thinking memories (experimental, tracked in git)
│       └── *.md                 # Thinking memory files (no keywords)
├── local_cache/                 # Embedding model cache (gitignored)
│   └── fast-bge-small-en-v1.5/  # BGE embedding model files
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
occurred_at: ISO-8601 timestamp
content_hash: SHA-256 prefix (16 chars)
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
| `occurred_at` | When the original event occurred (for deduplication and sorting) |
| `content_hash` | SHA-256 hash prefix of content (for deduplication) |

## Core Components

### Memory Manager (`src/core/memory.ts`)

CRD operations for memory files (no update - memories are idempotent):
- `createMemory(data)` - Create a new memory file (returns existing if duplicate)
- `deleteMemory(id)` - Delete a memory by ID
- `getMemory(id)` - Retrieve a specific memory
- `listMemories(filter?)` - List all memories with optional filtering
- `findDuplicate(occurredAt, contentHash)` - Check for existing duplicate

### Vector Store (`src/core/vector-store.ts`)

SQLite-backed vector store for semantic search:
- `initialize()` - Set up database and load sqlite-vec extension
- `add(memory)` - Add a memory with its embedding to the store
- `remove(id)` - Remove a memory from the store
- `search(query, options)` - Semantic similarity search
- `sync(memories)` - Sync store with file-based memories (add/remove as needed)

The store uses `better-sqlite3` with the `sqlite-vec` extension for vector similarity search. Embeddings are generated using `fastembed` with the BGE-small-en-v1.5 model.

#### Scoring and Ranking

Search results use a **cosine distance** similarity score:
- Score range: 0.0 (no match) to 1.0 (identical)
- Scores are rounded to 2 decimal places (e.g., 0.65)
- Results are sorted by score descending
- **Recency tie-breaker**: When scores are equal, more recent memories (`occurred_at`) are ranked first

### Search (`src/core/search.ts`)

Search implementation using the vector store:
- `search(query, options)` - Semantic search using vector embeddings
- Returns memories ranked by similarity score

## Claude Code Integration

### Hooks

Hooks are configured in `hooks.json` and execute as shell commands that receive JSON via stdin.

#### SessionStart Hook
Triggered when a Claude Code session begins:
1. Receives JSON input with `session_id`, `transcript_path`, `cwd`
2. Loads all memories from disk via `MemoryManager.listMemories()`
3. Returns the 5 most recent memories (sorted by `occurred_at`)
4. Outputs memory content to stdout (injected into Claude's context)

Note: This is a full reload, not incremental. The vector store is not used here to avoid slow initialization on every session start.

#### UserPromptSubmit Hook
Triggered when a user submits a prompt, before Claude processes it:
1. Receives JSON input with `session_id`, `transcript_path`, `cwd`, `prompt`
2. Initializes the vector store (lazy initialization, cached after first use)
3. Performs semantic search using vector embeddings
4. Outputs matching memories to stdout (injected into Claude's context)

#### Stop Hook (Disabled)
The Stop hook is currently disabled. Memory extraction is handled by the MCP server daemon which processes transcripts asynchronously every 5 minutes. See the MCP Server section for details.

### Installation

#### Setup

```bash
# Clone the repository
git clone https://github.com/local-recall/local-recall.git

# Install dependencies and build
cd local-recall
npm install
npm run build
```

#### Configure Hooks

Add hooks to your project's `.claude/settings.json`:

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
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./node_modules/local-recall/dist/hooks/user-prompt-submit.js",
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
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./dist/hooks/user-prompt-submit.js",
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

**When local-recall is installed as an npm package:**

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

**When running from the local-recall project directory:**

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
node ./dist/mcp-server/server.js
```

### Available Tools

| Tool | Description |
|------|-------------|
| `memory_create` | Create a new memory (idempotent) |
| `memory_get` | Retrieve a specific memory by ID |
| `memory_search` | Semantic search using vector embeddings |
| `memory_list` | List all memories with optional filtering |
| `index_rebuild` | Sync vector store with memory files |

### Background Daemon

The MCP server runs a background daemon that:
- Syncs transcripts from Claude's cache (`~/.claude/projects/<project>/transcripts/`)
- Processes transcripts using `claude -p` to extract memories
- Tracks processed transcripts with content hashes for change detection
- Deletes and recreates memories when transcripts change
- Runs every 5 minutes

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5.9+

### Setup
```bash
npm install
npm run build
```

### Embedding Model

Local Recall uses the `fastembed` library with the BGE-small-en-v1.5 model (~133MB) for semantic search. The model is automatically downloaded to `local_cache/` on first use.

**First run:** The initial startup may take 30-60 seconds while the model downloads. Subsequent runs load from cache.

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
  "maxMemories": 1000
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `memoryDir` | `./local-recall` | Directory for memory storage |
| `maxMemories` | `1000` | Maximum number of memories |

## Contributing

1. All memory files use YAML frontmatter for metadata
2. Keep memories atomic - one concept per memory
3. Use specific keywords for better searchability
4. Test hooks locally before committing

## Notes for AI Assistants

When working with this codebase:
- Memory files are markdown with YAML frontmatter
- Memory files ARE version-controlled - they will be committed to git
- The SQLite database (`local-recall/memory.sqlite`) is gitignored and auto-generated
- Vector embeddings are generated automatically when memories are added to the store
- Use the provided MCP tools rather than direct file manipulation
- New memories should have relevant, specific keywords
- Consider scope carefully: `global` vs `file:` vs `area:`

### Development Requirements

**ALWAYS create comprehensive tests and documentation:**
- All new features must have corresponding unit tests in `tests/unit/`
- Integration tests go in `tests/integration/`
- Documentation must be placed in the `docs/` folder
- Update existing docs when modifying functionality
- Tests should cover both happy paths and edge cases

## Troubleshooting

### Tokenizer file not found error

```
Error: Tokenizer file not found at local_cache/fast-bge-small-en-v1.5/tokenizer.json
```

This error occurs when the embedding model cache is corrupted or incomplete (usually from an interrupted download). To fix:

```bash
# Remove the corrupted cache
rm -rf local_cache/fast-bge-small-en-v1.5*

# The model will re-download automatically on next run
```

### Slow first startup

The first run downloads the BGE-small-en-v1.5 embedding model (~133MB). This is normal and only happens once. The model is cached in `local_cache/` for subsequent runs.
