---
id: fae62bbf-c97d-44bb-b19d-bfd3f93fe557
subject: Memory extraction uses claude -p for keyword extraction from transcripts
keywords:
  - memory-extraction
  - claude-haiku
  - keyword-extraction
  - transcript-processing
  - mcp-server
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T15:57:04.472Z'
content_hash: b5f26a0b8f05f7eb
---
# Memory Extraction Process

The MCP server background daemon uses `claude -p --model haiku` to extract keywords and identify valuable information from transcripts.

## Process

1. Reads transcript JSONL files from `~/.claude/projects/<project>/transcripts/`
2. Parses transcript content
3. Sends transcript to Claude Haiku for keyword/memory extraction
4. Uses returned keywords to create memory objects
5. Stores memories as markdown files in `local-recall/episodic-memory/`

## Key Details

- Uses Claude Haiku for cost efficiency
- Runs every 5 minutes as a background daemon
- Tracks processed transcripts with content hashes to detect changes
- Idempotent: deletes and recreates memories when source transcripts change

## Location

Implementation in `src/mcp-server/server.ts` - the background daemon loop.
