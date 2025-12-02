---
id: 75bdea43-ab2a-40fd-97eb-2dcfbfdbea84
subject: Claude project transcripts location and naming convention on macOS
keywords:
  - claude
  - transcripts
  - projects
  - path
  - macos
  - cache
  - naming-convention
applies_to: global
occurred_at: '2025-12-01T16:06:17.617Z'
content_hash: ce8861a67bf91fed
---
# Claude Project Transcripts Storage

Claude Code stores project transcripts in `~/.claude/projects/` directory on macOS.

## Path Naming Convention

Project folders use the absolute working directory path with slashes replaced by dashes:
- Example: `/Users/joe/Code/Syntessera/local-recall` → `Users-joe-Code-Syntessera-local-recall`
- Full path: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/`

## Transcript Organization

Within the project folder:
- Transcripts stored in `transcripts/` subdirectory
- Individual transcript files with `.jsonl` extension
- Each line is a JSON event from the session
