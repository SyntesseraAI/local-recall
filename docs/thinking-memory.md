# Thinking Memories

Thinking Memories captures Claude's reasoning paired with its output, providing examples of "how I thought → what I produced" for future sessions.

## Overview

While episodic memories extract curated facts from conversations, thinking memories take a different approach:

- **Direct extraction**: Thinking blocks are extracted directly from transcripts without AI processing
- **Higher parallelism**: Processes 20 transcript files concurrently (vs 5 for episodic memories)
- **No keywords**: Thinking memories don't use keywords (subjects are auto-generated from content)
- **Separate index**: Uses its own Orama index for independent operation

## Architecture

```
src/
├── core/
│   ├── thinking-memory.ts         # CRUD operations for thinking memories
│   ├── thinking-vector-store.ts   # Orama vector store for thinking
│   ├── thinking-extractor.ts      # Extract thinking blocks (20 parallel)
│   ├── thinking-processed-log.ts  # Track processed transcripts
│   └── thinking-search.ts         # Semantic search engine
└── hooks/
    └── user-prompt-submit.ts      # Unified hook (episodic + thinking)
```

## File Format

Thinking memories store thought + output pairs:

```markdown
---
id: uuid-here
subject: Auto-generated from first ~100 chars of thinking...
applies_to: global
occurred_at: 2025-01-01T00:00:00.000Z
content_hash: abc123def456
---

## Thought

The user wants to add authentication. Let me think about the options:
1. JWT tokens - stateless, good for APIs
2. Session cookies - simpler but requires state

Given this is a REST API, JWT makes the most sense.

## Output

I'll implement JWT authentication for your API. Let me start by installing
the required packages and creating the auth middleware.
```

## Vector Storage

Thinking memories use **Orama** (pure JavaScript) for vector storage:

```
local-recall/
├── thinking-memory/              # Memory markdown files
│   └── *.md
├── orama-thinking-index.json     # Orama vector index
└── thinking-processed-log.jsonl  # Processed transcript tracking
```

**Benefits of Orama:**
- No native dependencies (pure JavaScript)
- No mutex or process isolation issues
- Indexes persist as JSON files
- Concurrent read access from hooks and MCP server

**Embeddings** are generated via **Ollama** with the `nomic-embed-text` model (768 dimensions).

## Extraction Process

The thinking extractor runs separately from episodic memory extraction:

1. **Sync transcripts** from Claude's cache (`~/.claude/projects/`)
2. **Check processed log** (`thinking-processed-log.jsonl`) for changes
3. **Parse JSONL** and extract `type: "thinking"` blocks
4. **Find paired output** - the text response following each thinking block
5. **Generate subject** from first ~100 characters of thinking content
6. **Create thinking memory** combining thought + output with `global` scope
7. **Add to vector store** for semantic search
8. **Record in processed log** for deduplication

### Parallel Processing

The extractor processes 20 transcript files concurrently:

```typescript
const DEFAULT_OPTIONS: Required<ThinkingExtractorOptions> = {
  concurrency: 20,
};
```

## Hook Integration

### Unified UserPromptSubmit Hook

The `user-prompt-submit.ts` hook handles both episodic and thinking memories based on configuration:

```typescript
// If thinkingEnabled: searches thinking memories
if (config.thinkingEnabled) {
  const thinkingResults = await thinkingSearchEngine.search(prompt, { limit: 50 });
  // Filter by thinkingMinSimilarity and thinkingMaxTokens
}
```

### Configuration

Control thinking memory behavior via `.local-recall.json`:

```json
{
  "thinkingEnabled": true,
  "thinkingMaxTokens": 1000,
  "thinkingMinSimilarity": 0.5
}
```

Or environment variables:
- `LOCAL_RECALL_THINKING_ENABLED` (default: `true`)
- `LOCAL_RECALL_THINKING_MAX_TOKENS` (default: `1000`)
- `LOCAL_RECALL_THINKING_MIN_SIMILARITY` (default: `0.5`)

### Example Output

When thinking memories are found, they appear in context as:

```markdown
# Local Recall: Previous Thoughts

Found 2 relevant thinking excerpts from previous sessions.

## The user wants to add authentication. Let me think...

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

## Differences from Episodic Memories

| Aspect | Episodic Memories | Thinking Memories |
|--------|-------------------|-------------------|
| Source | Full transcript | Only `thinking` blocks + outputs |
| Processing | Claude CLI extraction | Direct content extraction |
| Keywords | Required (1-20) | None |
| Concurrency | 5 files | 20 files |
| Storage | `episodic-memory/` | `thinking-memory/` |
| Processed Log | `processed-log.jsonl` | `thinking-processed-log.jsonl` |
| Vector Index | `orama-episodic-index.json` | `orama-thinking-index.json` |
| Hook Output | "Relevant Memories" | "Previous Thoughts" |

## Running the Extractor

The thinking extractor runs automatically as part of the MCP server daemon. It can also be invoked programmatically:

```typescript
import { runThinkingExtraction } from './core/thinking-extractor.js';

const results = await runThinkingExtraction('/path/to/project');
console.log(`Processed ${results.length} transcripts`);
```

## Git Tracking

- **Tracked**: `local-recall/thinking-memory/*.md` (version-controlled)
- **Ignored**: `thinking-processed-log.jsonl` (auto-generated)
- **Ignored**: `orama-thinking-index.json` (auto-generated)

## Resetting Thinking Memories

To fully reset thinking memories and reprocess from scratch:

```bash
# Delete processed log, index, and memories
rm local-recall/thinking-processed-log.jsonl
rm local-recall/orama-thinking-index.json
rm -rf local-recall/thinking-memory/

# The next daemon run will recreate everything
```

## Disabling Thinking Memories

To disable thinking memory retrieval while keeping the data:

```json
{
  "thinkingEnabled": false
}
```

Or:
```bash
export LOCAL_RECALL_THINKING_ENABLED=false
```

This prevents thinking memories from being searched and injected, but the extraction daemon will still create them. To fully disable extraction, the MCP server daemon logic would need modification.

## Use Cases

Thinking memories are particularly useful for:

1. **Similar problems**: When facing a problem you've solved before, seeing your previous reasoning helps
2. **Code patterns**: Understanding why certain architectural decisions were made
3. **Debugging approaches**: Recalling investigation strategies for similar issues
4. **Decision rationale**: Remembering why one approach was chosen over alternatives

The thought + output pairing provides both the reasoning and the concrete result, making it easier to adapt previous solutions to new contexts.
