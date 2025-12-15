# MCP Server

## Overview

Local Recall includes an MCP (Model Context Protocol) server that exposes memory tools to any MCP-compatible client. This enables AI assistants beyond Claude Code to interact with the memory system.

## Starting the Server

```bash
# Using npm script
npm run mcp:start

# Direct execution (after build)
node ./dist/mcp-server/server.js
```

## Available Tools

### Episodic Memory Tools

#### episodic_create

Create a new episodic memory.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "subject": {
      "type": "string",
      "description": "Brief description of the memory (1-200 chars)"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Searchable keywords (1-20 keywords)"
    },
    "applies_to": {
      "type": "string",
      "description": "Scope: 'global', 'file:<path>', or 'area:<name>'"
    },
    "content": {
      "type": "string",
      "description": "The memory content in markdown"
    }
  },
  "required": ["subject", "keywords", "applies_to", "content"]
}
```

**Example**:
```json
{
  "subject": "API rate limiting configuration",
  "keywords": ["api", "rate-limit", "throttling"],
  "applies_to": "area:api",
  "content": "# Rate Limiting\n\nThe API uses a token bucket algorithm..."
}
```

**Response**:
```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Episodic memory created successfully"
}
```

#### episodic_get

Retrieve a specific episodic memory by ID.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Memory UUID"
    }
  },
  "required": ["id"]
}
```

**Response**:
```json
{
  "id": "...",
  "subject": "...",
  "keywords": ["..."],
  "applies_to": "...",
  "content": "...",
  "occurred_at": "...",
  "content_hash": "..."
}
```

#### episodic_search

Search episodic memories using semantic vector similarity.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (natural language)"
    },
    "scope": {
      "type": "string",
      "description": "Optional scope filter"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results (default: 10)"
    },
    "max_tokens": {
      "type": "number",
      "description": "Maximum tokens to return (default: 2000)"
    }
  },
  "required": ["query"]
}
```

**Example**:
```json
{
  "query": "authentication jwt",
  "scope": "area:api",
  "limit": 5
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "...",
      "subject": "JWT authentication setup",
      "similarity": 0.85,
      "keywords": ["auth", "jwt", "tokens"],
      "applies_to": "area:api"
    }
  ],
  "total": 1
}
```

### Thinking Memory Tools

#### thinking_get

Retrieve a specific thinking memory by ID.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Thinking memory UUID"
    }
  },
  "required": ["id"]
}
```

**Response**:
```json
{
  "id": "...",
  "subject": "...",
  "applies_to": "...",
  "content": "...",
  "occurred_at": "...",
  "content_hash": "..."
}
```

#### thinking_search

Search thinking memories using semantic vector similarity.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (natural language)"
    },
    "scope": {
      "type": "string",
      "description": "Optional scope filter"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results (default: 10)"
    },
    "max_tokens": {
      "type": "number",
      "description": "Maximum tokens to return (default: 2000)"
    }
  },
  "required": ["query"]
}
```

**Response**:
```json
{
  "results": [
    {
      "id": "...",
      "subject": "Analyzing the authentication flow...",
      "similarity": 0.82,
      "applies_to": "global"
    }
  ],
  "total": 1
}
```

## Background Transcript Processing

The MCP server includes a daemon loop that automatically processes Claude Code transcripts and extracts memories. This replaces the Stop hook approach for better performance.

### How It Works

1. **Transcript Collection**: Every 5 minutes, the daemon checks `~/.claude/projects/<project>/transcripts/` for transcript files
2. **Change Detection**: Each transcript's content hash is tracked in `local-recall/processed-log.jsonl`
3. **Memory Extraction**: New/modified transcripts are sent to `claude -p` CLI for intelligent memory extraction
4. **Idempotent Storage**: Memories are created with `occurred_at` and `content_hash` for deduplication

### Storage Structure

```
local-recall/
├── episodic-memory/              # Extracted episodic memories
│   └── *.md
├── thinking-memory/              # Extracted thinking memories
│   └── *.md
├── orama-episodic-index.json     # Orama vector index for episodic
├── orama-thinking-index.json     # Orama vector index for thinking
├── processed-log.jsonl           # Episodic transcript tracking
├── thinking-processed-log.jsonl  # Thinking transcript tracking
└── recall.log                    # Debug log
```

### Vector Search

The MCP server uses **Orama** (pure JavaScript) for vector storage and search:
- No native dependencies or mutex issues
- Embeddings generated via **Ollama** with `nomic-embed-text` model (768 dimensions)
- Indexes are persisted as JSON files
- Supports concurrent read access from multiple processes

### Memory Extraction Prompt

The daemon uses Claude CLI to analyze transcripts with a prompt that asks:
- What did the assistant learn about the codebase?
- What problems were solved and how?
- What patterns or approaches were discovered?
- What information would be useful in future sessions?

### Processed Log Format

```jsonl
{"transcriptPath":"session-abc123.jsonl","contentHash":"a1b2c3d4","processedAt":"2025-01-15T10:30:00Z","memoryIds":["uuid-1","uuid-2"]}
```

When a transcript changes:
1. Old memories are deleted (using tracked IDs)
2. Transcript is re-processed
3. New memories are created
4. Log is updated with new memory IDs

## Server Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOCAL_RECALL_DIR` | `./local-recall` | Memory storage path |
| `LOCAL_RECALL_LOG_LEVEL` | `error` | Log level: debug, info, warn, error |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model name |

## Client Integration

### Using with Claude Code

Add to your Claude Code MCP configuration in `.claude/settings.json`:

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

### Using with Other MCP Clients

The server uses stdio transport for MCP communication.

## Error Handling

All tools return errors in this format:

```json
{
  "error": {
    "code": "MEMORY_NOT_FOUND",
    "message": "Memory with ID xyz not found"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `MEMORY_NOT_FOUND` | Specified memory ID doesn't exist |
| `INVALID_INPUT` | Input validation failed |
| `INDEX_ERROR` | Index operation failed |
| `STORAGE_ERROR` | File system error |
| `OLLAMA_ERROR` | Ollama embedding service unavailable |

## Logging

Enable detailed logging:

```bash
LOCAL_RECALL_LOG_LEVEL=debug npm run mcp:start
```

Log levels: `error` (default), `warn`, `info`, `debug`

Logs are written to `local-recall/recall.log`.

## Prerequisites

The MCP server requires **Ollama** to be running for embedding generation:

```bash
# Install Ollama
brew install ollama  # macOS

# Pull the embedding model
ollama pull nomic-embed-text

# Start Ollama server
ollama serve
```

If Ollama is not available, search operations will fail with an `OLLAMA_ERROR`.
