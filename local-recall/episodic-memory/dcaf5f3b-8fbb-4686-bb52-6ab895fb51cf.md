---
id: dcaf5f3b-8fbb-4686-bb52-6ab895fb51cf
subject: Claude Code project transcript files location on macOS
keywords:
  - claude
  - projects
  - transcripts
  - jsonl
  - file-location
  - macos
  - paths
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:28:46.067Z'
content_hash: 389185ada9a31749
---
Claude Code stores project transcripts in `~/.claude/projects/` directory. The project folder name is derived from the absolute path with slashes replaced by dashes (e.g., `/Users/joe/Code/Syntessera/local-recall` becomes `-Users-joe-Code-Syntessera-local-recall`). Transcript files are stored as `.jsonl` files in the `transcripts/` subdirectory of each project folder.
