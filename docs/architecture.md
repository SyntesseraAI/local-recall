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
│                     Utilities Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Markdown   │  │  Transcript  │  │     Config       │  │
│  │  (keywords)  │  │  (analysis)  │  │    (settings)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
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

### Utilities Layer (`src/utils/`)

Shared utility functions used across the application:

#### Markdown Utilities (`markdown.ts`)

Central module for text processing:

- **parseMarkdown()**: Parse markdown with YAML frontmatter
- **serializeMemory()**: Convert memory objects to markdown
- **extractKeywordsFromText()**: RAKE-based keyword extraction with POS tagging
- **formatMemoryForDisplay()**: Format memory for human-readable output

The `extractKeywordsFromText()` function uses the [rake-pos](https://github.com/hlo-world/rake-pos) library for intelligent keyword extraction. All keyword extraction across the codebase goes through this function for consistency.

#### Transcript Utilities (`transcript.ts`)

Functions for processing Claude Code transcripts:

- **parseTranscript()**: Parse JSON transcript input
- **extractNewMessages()**: Filter messages by time window
- **analyzeForMemories()**: Detect memory-worthy content patterns
- **readStdin()**: Read input from stdin for hooks

The transcript module uses `extractKeywordsFromText()` from markdown.ts to ensure consistent keyword extraction across all memory creation paths.

#### Configuration (`config.ts`)

Configuration loading and validation:

- **loadConfig()**: Load from file and environment
- **getConfig()**: Get cached configuration
- **validateConfig()**: Validate configuration objects

#### Fuzzy Matching (`fuzzy.ts`)

Low-level fuzzy string matching algorithms:

- **levenshteinDistance()**: Calculate edit distance
- **stringSimilarity()**: Normalized similarity score
- **fuzzyMatch()**: Check if strings match within threshold
- **fuzzyFilter()**: Filter array by fuzzy match

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
2. Stop hook receives transcript JSON via stdin
3. Transcript file read (JSONL format)
4. Recent messages extracted (last 30s)
5. Content analyzed for memory-worthy patterns
6. Keywords extracted using RAKE algorithm (via markdown.ts)
7. New memories created with extracted keywords
8. Index refreshed
```

## Concurrency Considerations

- Index operations use file locking to prevent corruption
- Memory writes are atomic (write to temp, then rename)
- Read operations can proceed concurrently
- Index is cached in memory with periodic refresh
