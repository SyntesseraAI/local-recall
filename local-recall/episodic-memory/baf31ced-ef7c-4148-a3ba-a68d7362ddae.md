---
id: baf31ced-ef7c-4148-a3ba-a68d7362ddae
subject: transcript-collector.ts file structure and purpose
keywords:
  - transcript-collector
  - typescript
  - implementation
  - file-structure
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-01T16:06:57.110Z'
content_hash: ad4c617ebad516c9
---
# Transcript Collector Implementation

The `transcript-collector.ts` file is responsible for reading and parsing Claude Code project transcripts.

## Current State

File exists at `src/core/transcript-collector.ts` and is being actively developed/refactored.

## Purpose

Collects transcripts from Claude Code's cache directory (`~/.claude/projects/*/transcripts/`) for memory extraction by the MCP server daemon.

## Integration

This module is part of the memory extraction pipeline:
1. MCP server daemon runs every 5 minutes
2. Calls transcript collector to read new/modified transcripts
3. Processes transcripts to extract memories
4. Tracks processed transcripts with content hashes for change detection
