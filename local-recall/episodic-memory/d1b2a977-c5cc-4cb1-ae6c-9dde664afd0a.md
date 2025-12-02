---
id: d1b2a977-c5cc-4cb1-ae6c-9dde664afd0a
subject: Memory extraction uses claude-haiku for keyword analysis
keywords:
  - memory-extraction
  - keywords
  - claude-haiku
  - llm-analysis
  - transcript-processing
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T16:14:38.978Z'
content_hash: 48604b5eb899c3ba
---
# Memory Extraction Keyword Analysis

## Overview

The local-recall system uses Claude Haiku to analyze transcripts and extract keywords/memories.

## Process

1. The MCP server's background daemon reads transcript JSONL files
2. Transcripts are sent to Claude Haiku for analysis
3. Claude Haiku extracts:
   - Keywords for indexing
   - Memory content
   - Scope determination (global, file-specific, or area-specific)
4. Extracted memories are stored as markdown files in `local-recall/episodic-memory/`

## Benefits

- Uses lightweight Claude Haiku model for efficiency
- Leverages Claude's understanding of code and conversations
- Automatically discovers relevant keywords
- Maintains consistency with manual memory creation
