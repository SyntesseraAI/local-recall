---
id: bbbcc7ef-77ff-4e6d-a7a4-fb8fb8467d6b
subject: Claude project transcripts location and format on macOS
keywords:
  - claude
  - transcripts
  - projects
  - path
  - macos
  - jsonl
  - cache
  - file-path
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:12:30.237Z'
content_hash: 723867c36bf95cb7
---
# Claude Project Transcripts Location and Format

Claude Code stores project transcripts in the user's local cache on macOS:

## Directory Location
`~/.claude/projects/`

## Folder Naming Convention
Project folders are named with a hash-like identifier based on the project path. For the local-recall project:
- Path: `/Users/joe/Code/Syntessera/local-recall`
- Folder: `~/.claude/projects/01HQY8jXfJm7zh35BcYYiE1u/`

## Transcript Files
Transcripts are stored as JSONL (JSON Lines) format with the `.jsonl` extension:
- Location: `~/.claude/projects/<project-id>/transcripts/`
- Multiple transcript files exist for different sessions
- Each line is a separate JSON object representing a transcript event

## Transcript Structure
Each transcript file contains events with:
- Message content
- Tool invocations and results
- Timestamps
- User input and assistant responses

This is used by the MCP server daemon to process transcripts and extract memories asynchronously.
