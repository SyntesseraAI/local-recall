---
id: 9cb2fefa-aebe-4491-b64c-b20135dcdf02
subject: >-
  Claude project transcripts stored at ~/.claude/projects with path-based
  directory naming
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - macos
  - transcript-collector
  - directory-structure
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T21:08:19.582Z'
content_hash: 4f5c4e3f6a6d0864
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Directory Naming Convention

The project folder name is derived from the absolute working directory with slashes replaced by dashes:
- Full path: `/Users/joe/Code/Syntessera/local-recall`
- Becomes: `Users-joe-Code-Syntessera-local-recall`
- Location: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/transcripts/`

This allows Claude to organize transcripts by project based on the working directory path.
