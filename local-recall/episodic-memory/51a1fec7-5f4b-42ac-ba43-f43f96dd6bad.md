---
id: 51a1fec7-5f4b-42ac-ba43-f43f96dd6bad
subject: >-
  Background daemon processes transcripts every 5 minutes using claude -p for
  memory extraction
keywords:
  - daemon
  - background
  - memory-extraction
  - transcripts
  - interval
  - claude-prompt
applies_to: 'area:mcp-server'
occurred_at: '2025-12-01T16:00:04.220Z'
content_hash: cb9e6d88935b0c7f
---
# Background Daemon Processing

The MCP server runs a background daemon that:

1. **Syncs transcripts** from `~/.claude/projects/<project>/transcripts/`
2. **Processes transcripts** using `claude -p` to extract memories
3. **Tracks processing** with content hashes for change detection
4. **Manages memories** - deletes and recreates when transcripts change
5. **Runs every 5 minutes** automatically

## Tracking Changes

Content hashes are used to detect when a transcript has changed, allowing the daemon to:
- Identify new or modified transcripts
- Clean up memories from removed/changed transcripts
- Avoid reprocessing unchanged transcripts

This mechanism ensures memories stay in sync with the latest transcript data.
