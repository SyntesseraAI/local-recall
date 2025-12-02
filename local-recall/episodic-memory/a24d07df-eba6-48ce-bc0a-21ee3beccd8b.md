---
id: a24d07df-eba6-48ce-bc0a-21ee3beccd8b
subject: Memory extraction uses Claude Haiku via claude -p command
keywords:
  - memory-extraction
  - claude
  - haiku
  - transcript
  - summarization
applies_to: 'area:memory-extraction'
occurred_at: '2025-12-01T16:13:42.704Z'
content_hash: d76ac15cd45b6a2d
---
# Memory Extraction Process

Memory extraction from transcripts uses Claude Haiku through the `claude -p` command-line tool.

## Process

1. Read JSONL transcript file
2. Send transcript content to `claude -p --model haiku` via stdin
3. Prompt Claude to summarize and extract key learnings
4. Parse response to create memory entries
5. Store as markdown files in `local-recall/episodic-memory/`

## Benefits

- Fast summarization using lightweight Haiku model
- Extracts contextual, actionable memories from sessions
- Reduces manual memory entry for the project
