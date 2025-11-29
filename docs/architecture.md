# Architecture

## Overview

Local Recall is built with a modular architecture that separates concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    External Interfaces                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Claude Hooks │  │  MCP Server  │  │   CLI (future)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Memory    │  │    Index     │  │      Search      │  │
│  │   Manager    │  │   Manager    │  │      Engine      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  File System                          │  │
│  │   local-recall/memories/*.md    local-recall/index.json │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Core Layer

#### Memory Manager (`src/core/memory.ts`)

Handles all CRUD operations for memory files:

- **Create**: Generates new memory files with unique IDs
- **Read**: Parses markdown files with YAML frontmatter
- **Update**: Modifies existing memories while preserving metadata
- **Delete**: Removes memory files and updates the index

#### Index Manager (`src/core/index.ts`)

Maintains the keyword index for fast lookups:

- Scans all memory files in the storage directory
- Extracts keywords from YAML frontmatter
- Builds an inverted index mapping keywords to memory IDs
- Persists index to `local-recall/index.json`

#### Search Engine (`src/core/search.ts`)

Provides fuzzy search capabilities:

- Uses configurable fuzzy matching algorithm
- Supports multi-keyword queries
- Ranks results by relevance score
- Filters by scope (global/file/area)

### External Interfaces

#### Claude Code Hooks (`src/hooks/`)

Integration with Claude Code's hook system:

- **SessionStart**: Loads relevant memories into context
- **Stop**: Analyzes transcripts for memory-worthy content

#### MCP Server (`src/mcp-server/`)

Exposes memory tools via Model Context Protocol:

- Implements MCP tool interface
- Handles request/response serialization
- Manages concurrent access to memory store

### Storage Layer

#### File System Structure

```
local-recall/
├── index.json           # Keyword index (auto-generated)
└── memories/
    ├── <uuid-1>.md      # Individual memory files
    ├── <uuid-2>.md
    └── ...
```

## Data Flow

### Memory Creation

```
1. User/Agent provides memory content
2. Memory Manager validates input
3. UUID generated for new memory
4. Markdown file created with YAML frontmatter
5. Index Manager updates keyword index
6. Index persisted to disk
```

### Memory Search

```
1. Search query received
2. Query tokenized into keywords
3. Fuzzy matching against index
4. Matching memory IDs retrieved
5. Full memory content loaded
6. Results ranked and returned
```

### Session Start Flow

```
1. Claude Code session begins
2. SessionStart hook triggered
3. Index loaded from disk
4. Relevant memories identified
5. Context injected into session
```

### Stop Flow

```
1. Claude processing ends
2. Stop hook receives transcript JSON
3. Recent messages extracted (last 30s)
4. Content analyzed for memory-worthy info
5. New memories created/existing updated
6. Index refreshed
```

## Concurrency Considerations

- Index operations use file locking to prevent corruption
- Memory writes are atomic (write to temp, then rename)
- Read operations can proceed concurrently
- Index is cached in memory with periodic refresh
