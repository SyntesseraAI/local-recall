---
id: 258e4d5e-bbcf-4b7b-a0ba-8d7d45cd5e9f
subject: Claude project transcripts location and naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - macos
  - cache
  - project-naming
applies_to: global
occurred_at: '2025-12-01T21:17:28.049Z'
content_hash: 03c7c3a7626e950d
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory with slashes replaced by dashes and prefixed with `p`:
- `/Users/joe/Code/Syntessera/local-recall` → `p-Users-joe-Code-Syntessera-local-recall`

## Directory Structure

Transcripts are stored in:
- `~/.claude/projects/{project-folder}/transcripts/`
- Each session gets a timestamped JSON file: `{timestamp}.json`

This is useful when implementing MCP servers or tools that need to access Claude session transcripts for processing.
