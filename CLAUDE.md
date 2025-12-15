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
│   │   ├── vector-store.ts      # Orama vector store for semantic search
│   │   ├── embedding.ts         # Embedding service (Ollama)
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
│   │   ├── user-prompt-submit.ts # Unified semantic search (episodic + thinking)
│   │   └── stop.ts              # Parse transcript and create memories
│   ├── mcp-server/              # MCP server implementation
│   │   ├── server.ts            # Main MCP server + daemon
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
│   ├── .gitignore               # Auto-generated, excludes index files and recall.log
│   ├── orama-episodic-index.json  # Orama vector index for episodic memories (gitignored)
│   ├── orama-thinking-index.json  # Orama vector index for thinking memories (gitignored)
│   ├── recall.log               # Debug log file (gitignored)
│   ├── episodic-memory/         # Individual memory files (tracked in git)
│   │   └── *.md                 # Memory markdown files
│   └── thinking-memory/         # Thinking memories (tracked in git)
│       └── *.md                 # Thinking memory files (thought + output pairs)
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

Orama-backed vector store for semantic search:
- `initialize()` - Load or create the Orama index
- `add(memory)` - Add a memory with its embedding to the store
- `remove(id)` - Remove a memory from the store
- `search(query, options)` - Semantic similarity search
- `sync(memories)` - Sync store with file-based memories (add/remove as needed)
- `persist()` - Save the index to disk (JSON file)

The store uses Orama (pure JavaScript) for vector storage and search. Embeddings are generated using Ollama with the `nomic-embed-text` model (768 dimensions). Index files are stored as JSON (`orama-episodic-index.json`, `orama-thinking-index.json`).

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

### Architecture

Hooks use Orama directly (pure JavaScript) for vector search. Since Orama has no native dependencies, there are no mutex or process isolation issues.

```
┌─────────────────────┐              ┌─────────────────────┐
│   Hook Process      │              │   MCP Server        │
│   (direct search)   │              │   (background)      │
├─────────────────────┤              ├─────────────────────┤
│ • Orama search      │              │ • MCP tools         │
│ • Ollama embeddings │              │ • Transcript daemon │
│ • JSON index files  │              │ • Memory extraction │
└─────────────────────┘              └─────────────────────┘
         │                                     │
         └──────────────┬──────────────────────┘
                        │
           ┌────────────▼────────────┐
           │  local-recall/          │
           │  ├── episodic-memory/   │
           │  ├── thinking-memory/   │
           │  ├── orama-*-index.json │
           │  └── recall.log         │
           └─────────────────────────┘
```

### Hooks

Hooks are configured in `.claude/settings.json` and execute as shell commands that receive JSON via stdin.

#### SessionStart Hook
Triggered when a Claude Code session begins:
1. Receives JSON input with `session_id`, `transcript_path`, `cwd`
2. Reads the 5 most recent memories directly from files (sorted by `occurred_at`)
3. Outputs memory content to stdout (injected into Claude's context)

#### UserPromptSubmit Hook
Triggered when a user submits a prompt, before Claude processes it. This unified hook handles both episodic and thinking memories based on configuration:

1. Receives JSON input with `session_id`, `transcript_path`, `cwd`, `prompt`
2. Skips internal prompts (those containing `[LOCAL_RECALL_INTERNAL]`) used for memory extraction
3. If `episodicEnabled`: searches episodic memories using Orama + Ollama embeddings
4. If `thinkingEnabled`: searches thinking memories using Orama + Ollama embeddings
5. Filters results by similarity threshold and token budget
6. Combines results and outputs to stdout (injected into Claude's context)

Each memory type has independent configuration:
- **Episodic**: `episodicMaxTokens` (default: 1000), `episodicMinSimilarity` (default: 0.5)
- **Thinking**: `thinkingMaxTokens` (default: 1000), `thinkingMinSimilarity` (default: 0.5)

#### Stop Hook (Disabled)
The Stop hook is currently disabled. Memory extraction is handled by the MCP server daemon which processes transcripts asynchronously every 5 minutes. See the MCP Server section for details.

## Thinking Memories

Thinking memories capture Claude's reasoning paired with its output, providing examples of "how I thought → what I produced" for future sessions.

### Thinking Memory Format

```markdown
---
id: unique-memory-id
subject: Brief description (from first sentence of thinking)
applies_to: global
occurred_at: ISO-8601 timestamp
content_hash: SHA-256 prefix (16 chars)
---

## Thought

[Claude's internal reasoning/thinking block]

## Output

[The text response that followed the thinking]
```

### How Thinking Memories Work

1. **Extraction**: The daemon extracts thinking blocks from transcripts along with their corresponding text outputs (tool-only responses are skipped)
2. **Storage**: Each thought+output pair is stored as a single thinking memory
3. **Retrieval**: On each prompt, relevant thinking memories are retrieved based on:
   - Semantic similarity (minimum threshold, default 80%)
   - Token budget (maximum tokens, default 1000)
4. **Injection**: Retrieved memories are added to context as "Previous Thoughts"

### Example: How Thinking Memories Appear in Context

When the UserPromptSubmit thinking hook runs, it injects memories like this:

```markdown
# Local Recall: Previous Thoughts

Found 2 relevant thinking excerpts from previous sessions.

## The user wants to add authentication to the API

**ID:** a1b2c3d4-e5f6-7890-abcd-ef1234567890
**Scope:** global
**Occurred:** 2025-12-03T10:30:00.000Z

---

## Thought

The user wants to add authentication. Let me think about the options:
1. JWT tokens - stateless, good for APIs
2. Session cookies - simpler but requires state

Given this is a REST API, JWT makes the most sense.

## Output

I'll implement JWT authentication for your API. Let me start by installing
the required packages and creating the auth middleware.

*Similarity: 85%*

---
```

This provides concrete examples of "how I reasoned → what I produced" for similar tasks.

### Resetting Thinking Memories

To fully reset thinking memories and reprocess from scratch:

```bash
# Delete processed log, index, and memories
rm local-recall/thinking-processed-log.jsonl
rm local-recall/orama-thinking-index.json
rm -rf local-recall/thinking-memory/

# The next daemon run will recreate everything
```

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
  }
}
```

> **Note**: The Stop hook is currently disabled. Memory extraction is handled by the MCP server daemon.

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
| `episodic_create` | Create a new episodic memory (idempotent) |
| `episodic_get` | Retrieve a specific episodic memory by ID |
| `episodic_search` | Search episodic memories using vector embeddings |
| `thinking_get` | Retrieve a specific thinking memory by ID |
| `thinking_search` | Search thinking memories using vector embeddings |

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

Local Recall uses Ollama for embeddings with the `nomic-embed-text` model (768 dimensions, ~274MB).

**Prerequisites:**
1. Install Ollama: https://ollama.com
2. Pull the embedding model: `ollama pull nomic-embed-text`
3. Ensure Ollama is running: `ollama serve`

**Configuration:**
- `OLLAMA_BASE_URL` - Ollama server URL (default: `http://localhost:11434`)
- `OLLAMA_EMBED_MODEL` - Model name (default: `nomic-embed-text`)

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
  "episodicEnabled": true,
  "episodicMaxTokens": 1000,
  "episodicMinSimilarity": 0.5,
  "thinkingEnabled": true,
  "thinkingMaxTokens": 1000,
  "thinkingMinSimilarity": 0.5
}
```

### Configuration Options

| Option | Env Var | Default | Description |
|--------|---------|---------|-------------|
| `memoryDir` | `LOCAL_RECALL_DIR` | `./local-recall` | Directory for memory storage |
| `maxMemories` | `LOCAL_RECALL_MAX_MEMORIES` | `1000` | Maximum number of memories |
| `episodicEnabled` | `LOCAL_RECALL_EPISODIC_ENABLED` | `true` | Enable episodic memory retrieval |
| `episodicMaxTokens` | `LOCAL_RECALL_EPISODIC_MAX_TOKENS` | `1000` | Max tokens of episodic memories to inject per prompt |
| `episodicMinSimilarity` | `LOCAL_RECALL_EPISODIC_MIN_SIMILARITY` | `0.5` | Minimum similarity threshold (0.0-1.0) for episodic memories |
| `thinkingEnabled` | `LOCAL_RECALL_THINKING_ENABLED` | `true` | Enable thinking memory retrieval |
| `thinkingMaxTokens` | `LOCAL_RECALL_THINKING_MAX_TOKENS` | `1000` | Max tokens of thinking memories to inject per prompt |
| `thinkingMinSimilarity` | `LOCAL_RECALL_THINKING_MIN_SIMILARITY` | `0.5` | Minimum similarity threshold (0.0-1.0) for thinking memories |
| `fuzzyThreshold` | `LOCAL_RECALL_FUZZY_THRESHOLD` | `0.6` | Fuzzy matching threshold |
| `indexRefreshInterval` | `LOCAL_RECALL_INDEX_REFRESH` | `300` | Index refresh interval in seconds |
| `hooks.maxContextMemories` | `LOCAL_RECALL_MAX_CONTEXT` | `10` | Max episodic memories in context (session start only) |
| - | `LOCAL_RECALL_LOG_LEVEL` | `error` | Log level: debug, info, warn, error |

## Contributing

1. All memory files use YAML frontmatter for metadata
2. Keep memories atomic - one concept per memory
3. Use specific keywords for better searchability
4. Test hooks locally before committing

## Notes for AI Assistants

When working with this codebase:
- Memory files are markdown with YAML frontmatter
- Memory files ARE version-controlled - they will be committed to git
- Orama index files (`orama-*-index.json`) are gitignored and auto-generated
- Vector embeddings are generated via Ollama when memories are added to the store
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

### Ollama not available error

```
Error: Ollama not available at http://localhost:11434
```

Ensure Ollama is installed and running:

```bash
# Install Ollama (macOS)
brew install ollama

# Pull the embedding model
ollama pull nomic-embed-text

# Start Ollama server
ollama serve
```

### Migrating from fastembed

If you previously used fastembed (BGE-small-en-v1.5, 384 dimensions), you need to rebuild your vector indexes since the new model uses 768 dimensions:

```bash
# Delete old indexes (they will be rebuilt automatically)
rm local-recall/orama-episodic-index.json
rm local-recall/orama-thinking-index.json

# Optional: remove old model cache
rm -rf local_cache/
```
