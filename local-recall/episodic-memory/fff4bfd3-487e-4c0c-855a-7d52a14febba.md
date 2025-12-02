---
id: fff4bfd3-487e-4c0c-855a-7d52a14febba
subject: Transcript-collector module processes Claude Code transcripts asynchronously
keywords:
  - transcript-collector
  - mcp-server
  - memory-extraction
  - async
  - daemon
  - transcripts
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-01T16:15:26.374Z'
content_hash: bfb4dbe35cbb9df9
---
# Transcript Collector Module

The transcript-collector.ts module is responsible for reading and processing Claude Code transcripts to extract memories.

## Key Responsibilities

1. **Reading transcripts** - Accesses Claude's transcript files from `~/.claude/projects/`
2. **Parsing JSONL format** - Each line is a JSON event that needs to be parsed
3. **Memory extraction** - Uses Claude Haiku to analyze transcripts and extract valuable memories
4. **Async processing** - Runs asynchronously every 5 minutes as part of the MCP server daemon

## Integration

- Part of the MCP server background daemon
- Tracks processed transcripts to avoid reprocessing (using content hashes)
- Deletes old memories when transcripts are updated/changed
- Outputs extracted memories to the episodic-memory directory

## Current Status

The module was recently refactored to standardize quote handling and improve logging consistency.
