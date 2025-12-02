---
id: 4a09b1eb-eaef-4dbb-a367-ffdac20c3458
subject: >-
  Claude project transcripts are stored at ~/.claude/projects/ with path-based
  folder naming
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - jsonl
  - transcript-collector
  - cache-location
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:26:20.140Z'
content_hash: 0129d219935cba9c
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the project directory path using URL encoding:
- Forward slashes in the path are URL-encoded as `%2F`
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `Users%2Fjoe%2FCode%2FSyntessera%2Flocal-recall`
- The encoded path becomes the folder name under `~/.claude/projects/`

## File Structure

Within each project folder:
- `transcripts/` - Contains `.jsonl` files (one file per session)
- Each `.jsonl` file contains transcript events with IDs, types, and content
- Events include tool calls, results, and user/assistant messages

## Relevance to local-recall

The transcript-collector needs to:
1. Find the correct project folder using path encoding
2. Read and parse `.jsonl` transcript files
3. Extract memory-relevant information from transcript events
4. Handle missing or inaccessible transcript directories gracefully
