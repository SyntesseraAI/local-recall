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
│  │    Memory    │  │   Vector     │  │      Search      │  │
│  │   Manager    │  │   Store      │  │      Engine      │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Transcript  │  │   Memory     │  │   Processed      │  │
│  │  Collector   │  │  Extractor   │  │   Log Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Transcript  │  │  Embedding   │                        │
│  │  Condenser   │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Utilities Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Markdown   │  │    Logger    │  │     Config       │  │
│  │  (parsing)   │  │ (recall.log) │  │    (settings)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Transcript  │  │  Summarize   │  │   Gitignore      │  │
│  │  (parsing)   │  │  (text proc) │  │   (management)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  File System                          │  │
│  │   local-recall/episodic-memory/*.md  (memory files)   │  │
│  │   local-recall/orama-*-index.json    (vector indexes) │  │
│  │   Ollama server (embedding service)                   │  │
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

#### Transcript Condenser (`src/core/transcript-condenser.ts`)

Condenses transcripts for efficient processing:

- Reduces transcript size while preserving key information
- Prepares content for memory extraction

#### Search Engine (`src/core/search.ts`)

Provides semantic and fuzzy search capabilities:

- **Semantic search**: Uses vector embeddings for meaning-based similarity
- **Fuzzy search**: Configurable string matching algorithm for keyword queries
- Supports multi-keyword queries
- Ranks results by relevance score
- Filters by scope (global/file/area)

#### Vector Store (`src/core/vector-store.ts`)

Manages vector embeddings using Orama for semantic search:

- Uses Orama (pure JavaScript) for vector storage
- Stores memory metadata and vector embeddings
- Provides fast similarity search using cosine distance
- Auto-syncs with file-based memories

#### Embedding Service (`src/core/embedding.ts`)

Generates vector embeddings using Ollama:

- Uses `nomic-embed-text` model (768 dimensions) via HTTP API
- Requires Ollama running locally (`ollama serve`)
- Handles concurrent requests properly (no mutex issues)
- Singleton pattern for efficient initialization

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
├── .gitignore                  # Auto-generated
├── recall.log                  # Debug log (gitignored)
├── orama-episodic-index.json   # Orama vector index (gitignored)
├── orama-thinking-index.json   # Orama thinking index (gitignored)
└── episodic-memory/
    ├── <uuid-1>.md             # Individual memory files
    ├── <uuid-2>.md
    └── ...
```

The `.gitignore` file is automatically created, ensuring that generated files (`recall.log`, `orama-*.json`) are not committed while memory files are tracked.

Embeddings are generated by Ollama (requires `ollama serve` running locally).

## Data Flow

### Memory Creation

```
1. User/Agent provides memory content
2. Memory Manager validates input
3. UUID generated for new memory
4. Markdown file created with YAML frontmatter
5. Vector store updated with embedding
```

### Memory Search

```
1. Search query received
2. Query converted to embedding vector via Ollama
3. Vector similarity search in Orama index
4. Matching memories retrieved with scores
5. Results ranked by similarity (with recency tie-breaker)
6. Full memory content returned
```

### Session Start Flow

```
1. Claude Code session begins
2. SessionStart hook triggered
3. Recent memories loaded from disk
4. Top 5 most recent memories selected
5. Context injected into session
```

### User Prompt Submit Flow

```
1. User submits a prompt
2. UserPromptSubmit hook triggered
3. Vector store initialized (lazy, cached)
4. Semantic search using embeddings
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
5. Vector store synced with new memories
```

**Benefits over Stop Hook**:
- Non-blocking (doesn't slow down Claude responses)
- Intelligent extraction using Claude CLI
- Batch processing efficiency
- Change detection (only processes modified transcripts)

## Concurrency Considerations

- Memory writes are atomic (write to temp, then rename)
- Orama indexes are persisted after each change
- Multiple hook processes can read indexes concurrently (pure JavaScript, no mutex issues)
- Embedding service uses singleton pattern for efficiency
