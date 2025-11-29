# MCP Server

## Overview

Local Recall includes an MCP (Model Context Protocol) server that exposes memory tools to any MCP-compatible client. This enables AI assistants beyond Claude Code to interact with the memory system.

## Starting the Server

```bash
# Using npm script
npm run mcp:start

# Direct execution
npx ts-node src/mcp-server/server.ts

# With custom port
MCP_PORT=3001 npm run mcp:start
```

## Available Tools

### memory_create

Create a new memory.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "subject": {
      "type": "string",
      "description": "Brief description of the memory"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Searchable keywords"
    },
    "applies_to": {
      "type": "string",
      "description": "Scope: 'global', 'file:<path>', or 'area:<name>'"
    },
    "content": {
      "type": "string",
      "description": "The memory content (markdown)"
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
  "message": "Memory created successfully"
}
```

### memory_update

Update an existing memory.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Memory UUID to update"
    },
    "subject": { "type": "string" },
    "keywords": {
      "type": "array",
      "items": { "type": "string" }
    },
    "applies_to": { "type": "string" },
    "content": { "type": "string" }
  },
  "required": ["id"]
}
```

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "keywords": ["api", "rate-limit", "throttling", "redis"]
}
```

### memory_delete

Delete a memory by ID.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Memory UUID to delete"
    }
  },
  "required": ["id"]
}
```

### memory_search

Search memories using fuzzy keyword matching.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (keywords)"
    },
    "scope": {
      "type": "string",
      "description": "Optional scope filter"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results (default: 10)"
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
      "score": 0.95,
      "keywords": ["auth", "jwt", "tokens"],
      "applies_to": "area:api"
    }
  ],
  "total": 1
}
```

### memory_list

List all memories with optional filtering.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "scope": {
      "type": "string",
      "description": "Filter by scope"
    },
    "limit": {
      "type": "number",
      "description": "Maximum results"
    },
    "offset": {
      "type": "number",
      "description": "Pagination offset"
    }
  }
}
```

### memory_get

Retrieve a specific memory by ID.

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
  "created_at": "...",
  "updated_at": "..."
}
```

### index_rebuild

Force a rebuild of the memory index.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {}
}
```

**Response**:
```json
{
  "success": true,
  "memories_indexed": 42,
  "keywords_indexed": 156
}
```

## Server Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_PORT` | `3000` | Server port |
| `MCP_HOST` | `localhost` | Server host |
| `LOCAL_RECALL_DIR` | `./local-recall` | Memory storage path |

### Configuration File

Create `.mcp-server.json` in the project root:

```json
{
  "port": 3000,
  "host": "localhost",
  "memoryDir": "./local-recall",
  "cors": {
    "enabled": true,
    "origins": ["*"]
  },
  "rateLimit": {
    "enabled": true,
    "windowMs": 60000,
    "max": 100
  }
}
```

## Client Integration

### Using with Claude Code

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "local-recall": {
      "command": "npx",
      "args": ["ts-node", "src/mcp-server/server.ts"],
      "cwd": "/path/to/local-recall"
    }
  }
}
```

### Using with Other MCP Clients

Connect to `http://localhost:3000` (or configured host/port) using standard MCP protocol.

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

## Logging

Enable detailed logging:

```bash
MCP_LOG_LEVEL=debug npm run mcp:start
```

Log levels: `error`, `warn`, `info`, `debug`
