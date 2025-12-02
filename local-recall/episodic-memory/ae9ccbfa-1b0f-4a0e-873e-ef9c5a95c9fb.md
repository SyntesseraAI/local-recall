---
id: ae9ccbfa-1b0f-4a0e-873e-ef9c5a95c9fb
subject: >-
  The transcript collector daemon processes Claude transcripts asynchronously to
  extract and create memories
keywords:
  - transcript
  - daemon
  - async
  - memory-extraction
  - mcp-server
  - background-processing
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T11:55:54.764Z'
content_hash: eda329966af28b8c
---
# Transcript Collector Daemon

The Local Recall MCP server includes a background daemon that:

1. Monitors and processes Claude Code transcripts from `~/.claude/projects/`
2. Runs asynchronously (every 5 minutes according to CLAUDE.md)
3. Uses the `claude -p` command to extract structured memories from transcripts
4. Creates memory files from the extracted data
5. Tracks processed transcripts using content hashes to detect changes
6. Deletes and recreates memories when transcripts are modified

This allows memories to be automatically generated from session transcripts without requiring manual creation by the assistant.
