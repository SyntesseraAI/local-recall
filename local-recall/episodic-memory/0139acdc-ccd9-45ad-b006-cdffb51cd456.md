---
id: 0139acdc-ccd9-45ad-b006-cdffb51cd456
subject: >-
  Memory extraction from Claude transcripts requires keyword extraction and
  summarization
keywords:
  - memory-extraction
  - transcript-processing
  - keywords
  - summarization
  - claude-api
  - haiku
  - automation
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-02T07:05:01.417Z'
content_hash: 409f839bd9c703ec
---
# Memory Extraction from Transcripts

## Process Overview

When processing Claude Code transcripts to extract memories:

1. **Transcript Analysis**: Read JSONL transcript files from `~/.claude/projects/[encoded-path]/transcripts/`
2. **Keyword Extraction**: Use Claude Haiku API to extract relevant keywords from transcript content
3. **Summarization**: Condense transcript content into concise, actionable memories
4. **Memory Creation**: Use the memory creation tools to store extracted memories with proper metadata

## Implementation Details

- The user-prompt-submit hook uses `claude -p --model haiku` to extract keywords from prompts
- Keywords should be lowercase and specific to enable effective fuzzy searching
- Each memory should focus on one concept or discovery
- Use appropriate scope: `global`, `file:<path>`, or `area:<name>`

## Deduplication

Memories use `content_hash` (SHA-256 prefix) and `occurred_at` timestamp to prevent duplicates. The `findDuplicate()` function checks for existing memories before creating new ones.
