---
id: e5e3fcce-7bc9-4041-b86a-79afc9c0dd9d
subject: >-
  Claude transcript files stored in ~/.claude/projects/ with URL-encoded project
  paths
keywords:
  - claude
  - transcripts
  - projects
  - url-encoded
  - jsonl
  - cache
  - file-path
applies_to: 'area:transcript-collection'
occurred_at: '2025-12-01T16:17:10.287Z'
content_hash: ab40a20c4b4e8a39
---
# Claude Transcript Storage Location

Claude Code stores project transcripts in `~/.claude/projects/` with directory names that are URL-encoded versions of the project path.

## Key Details

- **Path format**: `~/.claude/projects/<url-encoded-project-path>/transcripts/`
- **File format**: JSONL files containing transcript events
- **Encoding**: Project paths are URL-encoded (e.g., `/Users/joe/Code/project` becomes `%2FUsers%2Fjoe%2FCode%2Fproject`)
- **Usage**: The MCP server and transcript-collector use this location to access and process transcripts

## Decoding URLs

When working with Claude's transcript cache, remember to decode URL-encoded paths using `decodeURIComponent()` in JavaScript/Node.js to get the original file system path.
