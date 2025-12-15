# Claude Code Hooks

## Overview

Local Recall integrates with Claude Code through hooks - automated scripts that execute at specific points during a Claude Code session. Hooks are configured in JSON format and receive input via stdin.

## Hook Configuration

Hooks are configured in `.claude/settings.json`:

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

## Hook Input Format

All hooks receive JSON via stdin with these common fields:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "SessionStart"
}
```

## Available Hooks

### SessionStart Hook

**Trigger**: When a Claude Code session begins

**Purpose**: Load relevant memories into the session context

**Input Fields**:
- `session_id`: Unique session identifier
- `transcript_path`: Path to the JSONL transcript file
- `cwd`: Current working directory

**Output**: Stdout text is injected into Claude's context

**Flow**:
1. Receives JSON input via stdin
2. Loads all memories from disk via MemoryManager
3. Sorts by `occurred_at` and selects 5 most recent
4. Outputs formatted memory content to stdout
5. Exit code 0 indicates success

### UserPromptSubmit Hook (Unified)

**Trigger**: When a user submits a prompt, before Claude processes it

**Purpose**: Search for relevant memories based on the user's prompt and add them to the context. This unified hook handles both episodic and thinking memories based on configuration.

**Input Fields**:
- `session_id`: Unique session identifier
- `transcript_path`: Path to the JSONL transcript file
- `cwd`: Current working directory
- `prompt`: The user's submitted prompt text

**Output**: Stdout text is injected into Claude's context (appears before Claude processes the prompt)

**Flow**:
1. Receives JSON input via stdin (includes `prompt` field)
2. Skips internal prompts (those containing `[LOCAL_RECALL_INTERNAL]`)
3. If `episodicEnabled`: searches episodic memories using Orama + Ollama embeddings
4. If `thinkingEnabled`: searches thinking memories using Orama + Ollama embeddings
5. Filters results by similarity threshold and token budget
6. Combines results and outputs formatted memories to stdout
7. Exit code 0 indicates success

**Search**:
- Uses vector similarity search via Orama (pure JavaScript)
- Embeddings generated using Ollama with nomic-embed-text model (768 dimensions)
- Returns memories ranked by semantic similarity
- Filters by minimum similarity threshold and token budget
- Falls back gracefully on error

**Configuration** (via `.local-recall.json` or environment variables):

| Option | Env Variable | Default | Description |
|--------|--------------|---------|-------------|
| `episodicEnabled` | `LOCAL_RECALL_EPISODIC_ENABLED` | `true` | Enable episodic memory search |
| `episodicMaxTokens` | `LOCAL_RECALL_EPISODIC_MAX_TOKENS` | `1000` | Max tokens of episodic memories |
| `episodicMinSimilarity` | `LOCAL_RECALL_EPISODIC_MIN_SIMILARITY` | `0.5` | Min similarity threshold (0-1) |
| `thinkingEnabled` | `LOCAL_RECALL_THINKING_ENABLED` | `true` | Enable thinking memory search |
| `thinkingMaxTokens` | `LOCAL_RECALL_THINKING_MAX_TOKENS` | `1000` | Max tokens of thinking memories |
| `thinkingMinSimilarity` | `LOCAL_RECALL_THINKING_MIN_SIMILARITY` | `0.5` | Min similarity threshold (0-1) |

**Example Output**:

When episodic memories are found:
```
# Local Recall: Relevant Memories

Found 2 memories related to your query.

## Memory about API design
**ID:** abc123
**Scope:** global
**Keywords:** api, rest, design
...
*Similarity: 85%*
```

When thinking memories are found:
```
# Local Recall: Previous Thoughts

Found 2 relevant thinking excerpts from previous sessions.

## Auto-generated subject from thinking content...
**ID:** def456
**Scope:** global
**Occurred:** 2025-01-01T00:00:00.000Z

---

## Thought

[Claude's reasoning]

## Output

[The response that followed]

*Similarity: 82%*
```

### Stop Hook (Disabled)

> **Note**: The Stop hook is currently disabled. Memory extraction is handled by the MCP server daemon which processes transcripts asynchronously every 5 minutes.

**Original Purpose**: Store conversation messages as memories after each response

**Current Approach**: Memory extraction has been moved to the MCP server which runs as a background daemon. This provides:
- Non-blocking operation (doesn't slow down Claude responses)
- Batch processing of transcripts
- Change detection (only re-processes modified transcripts)
- Claude CLI-based intelligent memory extraction

See [MCP Server documentation](./mcp-server.md) for details on the daemon-based memory extraction.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - JSON output processed, non-JSON stdout shown in verbose mode |
| 2 | Blocking error - stderr shown to Claude, JSON ignored |
| Other | Non-blocking error - stderr shown in verbose mode |

## Environment Variables

Available to hook commands:

| Variable | Description |
|----------|-------------|
| `LOCAL_RECALL_DIR` | Memory storage directory (default: `./local-recall`) |
| `LOCAL_RECALL_LOG_LEVEL` | Log level: debug, info, warn, error (default: error) |
| `LOCAL_RECALL_MAX_CONTEXT` | Max memories at session start (default: 5) |
| `OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434`) |
| `OLLAMA_EMBED_MODEL` | Embedding model (default: `nomic-embed-text`) |

## Debugging

### Enable Debug Logging

```bash
export LOCAL_RECALL_LOG_LEVEL=debug
```

Or run Claude Code with debug flag:
```bash
claude --debug
```

Logs are written to `local-recall/recall.log`.

### Test Hooks Manually

```bash
# Test session-start hook
echo '{"session_id":"test","cwd":"/path/to/project","transcript_path":"/tmp/transcript.jsonl"}' | \
  node dist/hooks/session-start.js

# Test user-prompt-submit hook (unified - searches both episodic and thinking)
echo '{"session_id":"test","cwd":"/path/to/project","transcript_path":"/tmp/transcript.jsonl","prompt":"tell me about the API design"}' | \
  node dist/hooks/user-prompt-submit.js
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Hook not triggering | Check hooks are configured in .claude/settings.json |
| No memories loaded | Verify local-recall/episodic-memory/ has .md files |
| Memories not being created | Check write permissions on local-recall/ |
| Ollama not available | Ensure Ollama is running: `ollama serve` |
| Wrong embedding model | Run: `ollama pull nomic-embed-text` |
| Slow first search | First run initializes embedding model (~274MB) |
| Hook timeout | Increase timeout in settings (default: 30s) |

## Security Considerations

- Hooks execute arbitrary shell commands automatically
- Always validate and sanitize inputs
- Use absolute file paths when possible
- Skip sensitive files (.env, credentials, keys)
- Review hook commands before enabling
