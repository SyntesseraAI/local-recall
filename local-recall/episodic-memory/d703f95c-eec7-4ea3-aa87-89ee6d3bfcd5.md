---
id: d703f95c-eec7-4ea3-aa87-89ee6d3bfcd5
subject: >-
  Transcript collector should compute hash from project path to locate Claude's
  transcript cache
keywords:
  - transcript-collector
  - path-hashing
  - claude-projects
  - mcp-server
  - background-daemon
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-02T07:02:46.575Z'
content_hash: deaa9db1f95f9ae0
---
# Transcript Collector Implementation

## Key Implementation Details

The `transcript-collector.ts` module is responsible for:
1. Receiving the project's working directory (`cwd`) from hooks or MCP context
2. Computing the same hash that Claude uses to create the project folder name in `~/.claude/projects/`
3. Locating the `transcripts/` folder within that project directory
4. Reading JSONL transcript files
5. Parsing and processing transcripts for memory extraction

## Hash Computation

- Must match Claude's own hash algorithm to correctly locate the transcript directory
- This is critical for the background MCP daemon to function properly
- The hash should be deterministic and consistent across sessions

## Integration with MCP Server

- The MCP server runs as a background daemon (every 5 minutes)
- It uses `transcript-collector` to sync transcripts from Claude's cache
- Processes new/modified transcripts to extract memories
- Tracks processed transcripts using content hashes for change detection
