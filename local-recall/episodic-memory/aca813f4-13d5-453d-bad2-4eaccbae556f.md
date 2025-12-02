---
id: aca813f4-13d5-453d-bad2-4eaccbae556f
subject: Transcript-collector handles special characters and path escaping
keywords:
  - transcript
  - collector
  - path
  - escaping
  - special-characters
  - encoding
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-01T16:26:01.345Z'
content_hash: 9c1bfced0b03dc2d
---
# Transcript Collector Path Handling

The transcript-collector component must handle:

1. **Path escaping**: Convert absolute paths to Claude's project folder naming scheme (slashes to dashes)
2. **Special characters**: Some systems may have special characters in paths that need proper handling
3. **Home directory expansion**: Properly resolve `~` to the user's home directory

## Implementation Notes

- Claude's project folders use the format: `_` prefix followed by path with slashes replaced by dashes
- Must support cross-platform path handling (macOS, Linux, Windows)
- When constructing transcript paths, combine: `~/.claude/projects/{projectFolder}/transcripts/`

This is essential for the background daemon to correctly locate transcript files for processing.
