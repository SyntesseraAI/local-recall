---
id: fdcddfb9-7635-4a2d-a04f-20e7dbeed19b
subject: Claude project transcripts location follows path-to-dash naming convention
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - macos
  - transcript-collector
  - path-conversion
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:16:17.520Z'
content_hash: 93fdd488aef216a5
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Naming Convention

The project folder name is derived from the absolute working directory path by replacing path separators (`/`) with dashes (`-`).

### Example
- Working directory: `/Users/joe/Code/Syntessera/local-recall`
- Claude projects directory: `~/.claude/projects/Users-joe-Code-Syntessera-local-recall/`

## File Format

Transcripts are stored in JSONL format:
- Filename: `transcripts.jsonl`
- Location: `~/.claude/projects/<project-id>/transcripts.jsonl`
- Each line is a JSON object representing a transcript event

## Implementation

The `transcript-collector.ts` module handles:
- Converting working directory paths to Claude's project ID format
- Reading and parsing JSONL transcript files
- Extracting transcript data for memory processing

This is critical for the MCP server's background daemon to correctly locate and process transcripts for memory extraction.
