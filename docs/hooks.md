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

### Stop Hook

**Trigger**: When Claude stops processing (after each response)

**Purpose**: Analyze the conversation for memory-worthy information

**Input Fields**:
- `session_id`: Unique session identifier
- `transcript_path`: Path to the JSONL transcript file (contains full conversation)
- `cwd`: Current working directory

**Transcript File Format** (JSONL):
```json
{"type": "message", "message": {"role": "user", "content": "..."}, "timestamp": "2025-01-15T10:30:00Z"}
{"type": "message", "message": {"role": "assistant", "content": "..."}, "timestamp": "2025-01-15T10:30:05Z"}
```

**Flow**:
1. Receives JSON input via stdin
2. Reads the transcript file
3. Filters to messages from last 30 seconds
4. Analyzes content for memory-worthy information
5. Creates memories and updates the index
6. Exit code 0 indicates success (non-blocking)

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
| `LOCAL_RECALL_DEBUG` | Enable debug logging when set to "1" |
| `LOCAL_RECALL_TIME_WINDOW` | Seconds to look back in stop hook (default: 30) |
| `LOCAL_RECALL_MAX_CONTEXT` | Max memories at session start (default: 10) |

## Memory Detection Heuristics

The stop hook analyzes messages for these patterns:

### Decision Indicators
- "We decided to..."
- "The approach is..."
- "Using X instead of Y because..."

### Problem Solutions
- "Fixed by..."
- "The issue was..."
- "Solution: ..."

### Configuration Details
- Environment variable mentions
- Config file changes
- Setup instructions

### Code Patterns
- Recurring code structures
- Import patterns
- API usage examples

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
