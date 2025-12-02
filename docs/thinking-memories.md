# Thinking Memories

Thinking Memories is an experimental A/B testing feature that captures and indexes Claude's thinking blocks for semantic search and context injection.

## Overview

While the main episodic memory system extracts curated memories from full conversation transcripts using Claude Haiku, Thinking Memories takes a different approach:

- **Direct extraction**: Thinking blocks are extracted directly from transcripts without AI processing
- **Higher parallelism**: Processes 20 transcript files concurrently (vs 5 for episodic memories)
- **No keywords**: Thinking memories omit keywords (subjects are auto-generated from content)
- **Separate index**: Uses its own SQLite tables and processed log for independent A/B testing

## Architecture

```
src/
├── core/
│   ├── thinking-memory.ts         # CRUD operations for thinking memories
│   ├── thinking-vector-store.ts   # SQLite tables + vector embeddings
│   ├── thinking-extractor.ts      # Extract thinking blocks (20 parallel)
│   ├── thinking-processed-log.ts  # Track processed transcripts
│   └── thinking-search.ts         # Semantic search engine
└── hooks/
    └── user-prompt-submit-thinking.ts  # Inject "Previous Thoughts"
```

## File Format

Thinking memories use a simplified format without keywords:

```markdown
---
id: uuid-here
subject: Auto-generated from first ~100 chars of content...
applies_to: global
occurred_at: 2025-01-01T00:00:00.000Z
content_hash: abc123def456
---

The actual thinking content goes here. This is Claude's raw
thinking block content, preserved as-is.
```

## SQLite Tables

Thinking memories use separate tables in the same `memory.sqlite` database:

```sql
-- Metadata table (no keywords column)
CREATE TABLE thinking_memories (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  applies_to TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Vector embeddings
CREATE VIRTUAL TABLE thinking_embeddings USING vec0(
  id TEXT PRIMARY KEY,
  embedding float[384]
);
```

## Extraction Process

The thinking extractor runs separately from the main memory extractor:

1. **Sync transcripts** from Claude's cache (`~/.claude/projects/`)
2. **Check processed log** (`thinking-processed-log.jsonl`) for changes
3. **Parse JSONL** and extract `type: "thinking"` blocks
4. **Generate subject** from first ~100 characters
5. **Create thinking memory** with `global` scope
6. **Add to vector store** for semantic search
7. **Record in processed log** for deduplication

### Parallel Processing

The extractor processes 20 transcript files concurrently:

```typescript
const DEFAULT_OPTIONS: Required<ThinkingExtractorOptions> = {
  concurrency: 20,
};
```

## Hook Integration

### UserPromptSubmit Hook

A separate hook (`user-prompt-submit-thinking.ts`) performs semantic search on thinking memories and injects them as "Previous Thoughts":

```markdown
# Local Recall: Previous Thoughts

Found 5 relevant thinking excerpts from previous sessions.

## Auto-generated subject from content...

**ID:** uuid
**Scope:** global
**Occurred:** 2025-01-01T00:00:00.000Z

---

Thinking content here...
*Similarity: 85%*
```

### Configuration

Add the thinking hook to your `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./dist/hooks/user-prompt-submit.js",
            "timeout": 30
          },
          {
            "type": "command",
            "command": "node ./dist/hooks/user-prompt-submit-thinking.js",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

## Differences from Episodic Memories

| Aspect | Episodic Memories | Thinking Memories |
|--------|-------------------|-------------------|
| Source | Full transcript | Only `thinking` blocks |
| Processing | Claude Haiku extraction | Direct content extraction |
| Keywords | Required (1-20) | None |
| Concurrency | 5 files | 20 files |
| Storage | `episodic-memory/` | `thinking-memories/` |
| Processed Log | `processed-log.jsonl` | `thinking-processed-log.jsonl` |
| SQLite Tables | `memories`, `memory_embeddings` | `thinking_memories`, `thinking_embeddings` |
| Hook Output | "Relevant Memories" | "Previous Thoughts" |

## Running the Extractor

The thinking extractor can be invoked programmatically:

```typescript
import { runThinkingExtraction } from './core/thinking-extractor.js';

const results = await runThinkingExtraction('/path/to/project');
console.log(`Processed ${results.length} transcripts`);
```

## Git Tracking

- **Tracked**: `local-recall/thinking-memories/*.md` (version-controlled)
- **Ignored**: `thinking-processed-log.jsonl` (auto-generated)
- **Ignored**: `memory.sqlite` (contains both memory and thinking embeddings)

## A/B Testing Notes

This feature is designed for A/B testing to evaluate whether raw thinking blocks provide better context than curated memories. Key metrics to consider:

1. **Relevance**: Do thinking memories surface more relevant context?
2. **Signal-to-noise**: Is raw thinking content too verbose?
3. **Recency bias**: Do older thinking patterns help or confuse?
4. **Token usage**: Impact on context window consumption

To disable thinking memories, simply remove the thinking hook from your settings.
