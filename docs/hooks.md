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
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ./node_modules/local-recall/dist/hooks/stop.js",
            "timeout": 60
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

### UserPromptSubmit Hook

**Trigger**: When a user submits a prompt, before Claude processes it

**Purpose**: Search for relevant memories based on the user's prompt and add them to the context

**Input Fields**:
- `session_id`: Unique session identifier
- `transcript_path`: Path to the JSONL transcript file
- `cwd`: Current working directory
- `prompt`: The user's submitted prompt text

**Output**: Stdout text is injected into Claude's context (appears before Claude processes the prompt)

**Flow**:
1. Receives JSON input via stdin (includes `prompt` field)
2. Initializes vector store (lazy initialization, cached)
3. Performs semantic search using vector embeddings
4. Outputs formatted matching memories to stdout
5. Exit code 0 indicates success

**Search**:
- Uses vector similarity search via SQLite + sqlite-vec
- Embeddings generated using fastembed (BGE-small-en-v1.5)
- Returns memories ranked by semantic similarity
- Falls back gracefully on error

**Example Output**:
```
# Local Recall: Relevant Memories

Found 2 memories related to your query.

## Memory about API design
**ID:** abc123
**Scope:** global
**Keywords:** api, rest, design
...
```

### UserPromptSubmit Thinking Hook (Experimental)

**Trigger**: When a user submits a prompt, before Claude processes it

**Purpose**: Search for relevant thinking memories (Claude's previous thought processes) and add them to the context as "Previous Thoughts"

**Input Fields**:
- `session_id`: Unique session identifier
- `transcript_path`: Path to the JSONL transcript file
- `cwd`: Current working directory
- `prompt`: The user's submitted prompt text

**Output**: Stdout text is injected into Claude's context

**Flow**:
1. Receives JSON input via stdin (includes `prompt` field)
2. Initializes thinking vector store (separate tables from main memories)
3. Performs semantic search on thinking memories
4. Outputs formatted matching thinking excerpts to stdout
5. Exit code 0 indicates success

**Configuration**: Add to `.claude/settings.json` alongside the main UserPromptSubmit hook:

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

**Example Output**:
```
# Local Recall: Previous Thoughts

Found 2 relevant thinking excerpts from previous sessions.

## Auto-generated subject from thinking content...
**ID:** abc123
**Scope:** global
**Occurred:** 2025-01-01T00:00:00.000Z

---
Thinking content here...
*Similarity: 85%*
```

See [Thinking Memories documentation](./thinking-memory.md) for details.

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
| `LOCAL_RECALL_LOG_LEVEL` | Log level: debug, info, warn, error (default: debug) |
| `LOCAL_RECALL_MAX_CONTEXT` | Max memories at session start (default: 5) |

## Debugging

### Enable Debug Logging

```bash
export LOCAL_RECALL_DEBUG=1
```

Or run Claude Code with debug flag:
```bash
claude --debug
```

### Test Hooks Manually

```bash
# Test session-start hook
echo '{"session_id":"test","cwd":"/path/to/project","transcript_path":"/tmp/transcript.jsonl"}' | \
  node dist/hooks/session-start.js

# Test user-prompt-submit hook
echo '{"session_id":"test","cwd":"/path/to/project","transcript_path":"/tmp/transcript.jsonl","prompt":"tell me about the API design"}' | \
  node dist/hooks/user-prompt-submit.js

# Test stop hook
echo '{"session_id":"test","cwd":"/path/to/project","transcript_path":"/tmp/transcript.jsonl"}' | \
  node dist/hooks/stop.js
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Hook not triggering | Check hooks are configured in .claude/settings.json |
| No memories loaded | Verify local-recall/episodic-memory/ has .md files |
| Memories not being created | Check write permissions on local-recall/ |
| Slow startup | First run downloads embedding model (~133MB) |
| Hook timeout | Increase timeout in settings (default: 30-60s) |

## Security Considerations

- Hooks execute arbitrary shell commands automatically
- Always validate and sanitize inputs
- Use absolute file paths when possible
- Skip sensitive files (.env, credentials, keys)
- Review hook commands before enabling
