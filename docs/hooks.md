# Claude Code Hooks

## Overview

Local Recall integrates with Claude Code through hooks - automated scripts that execute at specific points during a Claude Code session. Hooks are configured in JSON format and receive input via stdin.

## Hook Configuration

Hooks are defined in `hooks.json` following Claude Code's hook format:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PROJECT_DIR}/node_modules/local-recall/dist/hooks/session-start.js",
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
            "command": "node ${CLAUDE_PROJECT_DIR}/node_modules/local-recall/dist/hooks/user-prompt-submit.js",
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
            "command": "node ${CLAUDE_PROJECT_DIR}/node_modules/local-recall/dist/hooks/stop.js",
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
2. Loads memory index from `local-recall/index.json`
3. Identifies relevant memories based on context
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
2. Extracts keywords from the prompt using Claude Haiku (`claude -p --model haiku`)
3. Searches memory index for matching keywords (fuzzy matching)
4. Outputs formatted matching memories to stdout
5. Exit code 0 indicates success

**Keyword Extraction**:
- Uses Claude Haiku via CLI (`claude -p --model haiku`)
- Prompt: "Extract keywords from this text and return only the keywords as a JSON array"
- Filters out very short keywords (< 3 characters)
- Limits to 10 keywords per prompt
- Falls back gracefully to empty keywords on error

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
| `CLAUDE_PROJECT_DIR` | Project root directory |
| `LOCAL_RECALL_DIR` | Memory storage directory (default: `${CLAUDE_PROJECT_DIR}/local-recall`) |
| `LOCAL_RECALL_LOG_LEVEL` | Log level: debug, info, warn, error (default: debug) |
| `LOCAL_RECALL_MAX_CONTEXT` | Max memories at session start (default: 10) |

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
| Hook not triggering | Check plugin is enabled in Claude Code |
| No memories loaded | Verify index.json exists and has been built |
| Memories not being created | Check write permissions on local-recall/ |
| Slow startup | Reduce `LOCAL_RECALL_MAX_CONTEXT` |
| Hook timeout | Increase timeout in hooks.json (default: 60s) |

## Security Considerations

- Hooks execute arbitrary shell commands automatically
- Always validate and sanitize inputs
- Use absolute file paths when possible
- Skip sensitive files (.env, credentials, keys)
- Review hook commands before enabling
