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

Handles memory file operations:

- **createMemory()**: Creates new memory files with unique IDs (idempotent - returns existing if duplicate)
- **getMemory()**: Retrieves a memory by ID, parsing markdown with YAML frontmatter
- **listMemories()**: Lists all memories with optional filtering by scope or keyword
- **findDuplicate()**: Checks for existing memories with same `occurred_at` and `content_hash`

Memory creation is idempotent: if a memory with the same timestamp and content hash already exists, the existing memory is returned instead of creating a duplicate.

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

- **SessionStart**: Loads relevant memories into context at session start
- **UserPromptSubmit**: Searches for relevant memories based on user prompt keywords
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

- **parseMarkdown()**: Parse markdown with YAML frontmatter using gray-matter
- **serializeMemory()**: Convert memory objects to markdown
- **extractKeywordsFromText()**: Keyword extraction with stop word removal
- **formatMemoryForDisplay()**: Format memory for human-readable output

The `extractKeywordsFromText()` function uses the [keyword-extractor](https://www.npmjs.com/package/keyword-extractor) library for intelligent keyword extraction with stop word removal. Keywords are ranked by frequency and filtered by minimum length. All keyword extraction across the codebase goes through this function for consistency.

#### Transcript Utilities (`transcript.ts`)

Functions for processing Claude Code transcripts:

- **parseTranscript()**: Parse and validate JSON transcript input
- **extractNewMessages()**: Filter messages by time window
- **analyzeForMemories()**: Convert messages to memories (no filtering or summarization)
- **readStdin()**: Read input from stdin for hooks with timeout handling

The transcript module uses `extractKeywordsFromText()` from markdown.ts to ensure consistent keyword extraction across all memory creation paths.

**Filtering rules**: The `analyzeForMemories()` function only saves **assistant messages** that are **multi-line** (contain substantive content). User messages are not saved, and single-line assistant responses are skipped.

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
├── .gitignore           # Auto-generated, excludes index.json and recall.log
├── index.json           # Keyword index (auto-generated, gitignored)
├── recall.log           # Debug log (gitignored)
└── memories/
    ├── <uuid-1>.md      # Individual memory files
    ├── <uuid-2>.md
    └── ...
```

The `.gitignore` file is automatically created when the index is first built, ensuring that generated files (`index.json`, `recall.log`) are not committed while memory files are tracked.

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

### User Prompt Submit Flow

```
1. User submits a prompt
2. UserPromptSubmit hook triggered
3. Keywords extracted from prompt text
4. Fuzzy search against memory index
5. Matching memories output to stdout
6. Context injected before Claude processes prompt
```

### Stop Flow

```
1. Claude processing ends
2. Stop hook receives transcript JSON via stdin
3. Transcript file read (JSONL format)
4. All messages parsed from transcript
5. User messages and single-line assistant messages filtered out
6. Multi-line assistant messages converted to memories
7. Keywords extracted using keyword-extractor (via markdown.ts)
8. Memories created with deduplication (via occurred_at + content_hash)
9. Index refreshed
```

**Filtering**: Only assistant messages with multiple lines are saved. User messages are never saved. Duplicate memories are prevented using the `occurred_at` timestamp and `content_hash` fields.

## Concurrency Considerations

- Index operations use file locking to prevent corruption
- Memory writes are atomic (write to temp, then rename)
- Read operations can proceed concurrently
- Index is cached in memory with periodic refresh
