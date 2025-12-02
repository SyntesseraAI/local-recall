---
id: fbcf3a41-e544-4e71-aaa5-d14f0afaaea1
subject: Claude project transcripts location on macOS
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - cache
  - transcript-collector
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T15:56:37.477Z'
content_hash: 947476beca9f1b49
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is the absolute path with slashes replaced by dashes:
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Project folder: `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

Each transcript is a `.jsonl` file where each line is a JSON object representing one turn in the conversation.
