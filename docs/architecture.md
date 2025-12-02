# Architecture

## Overview

Local Recall is built with a modular architecture that separates concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    External Interfaces                       │
│  ┌──────────────┐  ┌────────────────────────────────────┐  │
│  │ Claude Hooks │  │  MCP Server + Daemon Loop          │  │
│  │  (Session &  │  │  (Tools + Transcript Processing)   │  │
│  │   Prompt)    │  │                                    │  │
│  └──────┬───────┘  └──────────────┬─────────────────────┘  │
└─────────┼──────────────────────────┼────────────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Memory    │  │    Index     │  │      Search      │  │
│  │   Manager    │  │   Manager    │  │      Engine      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Transcript  │  │   Memory     │  │   Processed      │  │
│  │  Collector   │  │  Extractor   │  │   Log Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Vector     │  │  Embedding   │                        │
│  │   Store      │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Utilities Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Markdown   │  │    Logger    │  │     Config       │  │
│  │  (keywords)  │  │ (recall.log) │  │    (settings)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  File System                          │  │
│  │   local-recall/episodic-memory/*.md  local-recall/index.json │
│  │   local-recall/memory.sqlite         processed-log.json │
│  │   local_cache/fast-bge-small-en-v1.5/  (model cache)    │
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
- **deleteMemory()**: Deletes a memory by ID
- **findDuplicate()**: Checks for existing memories with same `occurred_at` and `content_hash`

Memory creation is idempotent: if a memory with the same timestamp and content hash already exists, the existing memory is returned instead of creating a duplicate.

#### Transcript Collector (`src/core/transcript-collector.ts`)

Collects transcripts from Claude's cache:

- **findClaudeProjectDir()**: Auto-detects the Claude project directory for the current project
- **listSourceTranscripts()**: Lists all transcripts in Claude's cache
- **syncTranscripts()**: Copies new/modified transcripts to local storage
- **computeTranscriptHash()**: Computes content hash for change detection

#### Memory Extractor (`src/core/memory-extractor.ts`)

Extracts memories from transcripts using Claude CLI:

- **processTranscript()**: Processes a single transcript to extract memories
- **processAllTranscripts()**: Processes all unprocessed transcripts
- Uses `claude -p` with intelligent prompts to identify memory-worthy content
- Handles retry logic with exponential backoff

#### Processed Log Manager (`src/core/processed-log.ts`)

Tracks which transcripts have been processed:

- **needsProcessing()**: Checks if a transcript needs processing (new or modified)
- **recordProcessed()**: Records a transcript as processed with its memory IDs
- **getMemoryIds()**: Gets memory IDs created from a transcript (for cleanup on re-processing)

#### Index Manager (`src/core/index.ts`)

Maintains the keyword index for fast lookups:

- Scans all memory files in the storage directory
- Extracts keywords from YAML frontmatter
- Builds an inverted index mapping keywords to memory IDs
- Persists index to `local-recall/index.json`

#### Search Engine (`src/core/search.ts`)

Provides semantic and fuzzy search capabilities:

- **Semantic search**: Uses vector embeddings for meaning-based similarity
- **Fuzzy search**: Configurable string matching algorithm for keyword queries
- Supports multi-keyword queries
- Ranks results by relevance score
- Filters by scope (global/file/area)

#### Vector Store (`src/core/vector-store.ts`)

Manages SQLite database with vector embeddings for semantic search:

- Uses `better-sqlite3` with `sqlite-vec` extension
- Stores memory metadata and vector embeddings
- Provides fast similarity search using cosine distance
- Auto-syncs with file-based memories

#### Embedding Service (`src/core/embedding.ts`)

Generates vector embeddings using the fastembed library:

- Uses BGE-small-en-v1.5 model (384 dimensions)
- Model downloaded automatically on first use (~133MB)
- Cached in `local_cache/fast-bge-small-en-v1.5/`
- Singleton pattern for efficient model loading

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
├── memory.sqlite        # Vector store database (gitignored)
└── episodic-memory/
    ├── <uuid-1>.md      # Individual memory files
    ├── <uuid-2>.md
    └── ...

local_cache/
└── fast-bge-small-en-v1.5/   # Embedding model cache (gitignored)
    ├── config.json
    ├── model_optimized.onnx
    ├── tokenizer.json
    └── ...
```

The `.gitignore` file is automatically created when the index is first built, ensuring that generated files (`index.json`, `recall.log`, `memory.sqlite`) are not committed while memory files are tracked.

The embedding model cache (`local_cache/`) is stored at the project root and downloaded automatically on first use.

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

### Daemon Processing Flow (replaces Stop Hook)

```
1. MCP server daemon loop runs every 5 minutes
2. Transcript Collector syncs from ~/.claude/projects/<project>/transcripts/
3. Processed Log Manager checks for new/modified transcripts
4. For each transcript needing processing:
   a. Old memories deleted (if re-processing)
   b. Claude CLI called with extraction prompt
   c. Response parsed for memory objects
   d. Memories created with deduplication
   e. Processed log updated with memory IDs
5. Index refreshed
```

**Benefits over Stop Hook**:
- Non-blocking (doesn't slow down Claude responses)
- Intelligent extraction using Claude CLI
- Batch processing efficiency
- Change detection (only processes modified transcripts)

## Concurrency Considerations

- Index operations use file locking to prevent corruption
- Memory writes are atomic (write to temp, then rename)
- Read operations can proceed concurrently
- Index is cached in memory with periodic refresh
