---
id: ba3b31cb-67dd-431e-97ab-8c8ece5db16f
subject: >-
  Transcript collector implementation for memory extraction from Claude
  transcripts
keywords:
  - transcript-collector
  - memory-extraction
  - transcript-processing
  - jsonl
  - transcript-parsing
  - mcp-server
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:12:30.237Z'
content_hash: 36e209c50298debc
---
# Transcript Collector Implementation

The local-recall project includes a transcript collector module that:

## Purpose
- Reads JSONL transcript files from Claude's cache (`~/.claude/projects/<id>/transcripts/`)
- Processes transcripts asynchronously to extract memories
- Used by the MCP server daemon (runs every 5 minutes)

## Key Components
- Location: `src/core/transcript-collector.ts`
- Parses JSONL format transcript files
- Extracts events and session information
- Integrates with memory creation system

## Integration
- Part of the MCP server background daemon
- Tracks processed transcripts using content hashes
- Deletes and recreates memories when transcripts change
- Operates asynchronously without blocking other operations

This allows memories to be extracted from all Claude Code sessions automatically without user intervention.
