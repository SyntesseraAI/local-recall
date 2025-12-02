---
id: accdbc9d-3441-42fe-adfe-92049f58cf4e
subject: >-
  Transcript collector must handle JSONL parsing and path conversion for memory
  creation
keywords:
  - transcript
  - parsing
  - jsonl
  - memory-creation
  - path-conversion
  - mcp-server
  - daemon
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T06:42:03.114Z'
content_hash: e0105c3d7df084a6
---
# Transcript Collector Implementation Requirements

## Responsibilities

The transcript collector (part of the MCP server daemon) must:

1. **Locate transcripts** - Convert working directory paths to Claude's internal naming scheme
   - Transform `/Users/joe/Code/Syntessera/local-recall` → `Users-joe-Code-Syntessera-local-recall`
   - Check `~/.claude/projects/{project_name}/transcripts/`

2. **Parse JSONL files** - Each line is a separate JSON object
   - Don't attempt to parse the entire file as a single JSON object
   - Process line-by-line using `.split('\n')` and `JSON.parse()`

3. **Extract metadata** - Preserve important context
   - Extract `cwd`, `session_id`, and timestamp information
   - Use `cwd` to determine memory scope (global vs file-specific)

4. **Track processing** - Use content hashes for change detection
   - Store hashes of processed transcripts
   - Only reprocess when transcript content changes

## Integration Point

The daemon runs every 5 minutes and:
1. Checks for new or modified transcript files
2. Processes only changed transcripts (via content hash)
3. Creates memories using the extracted metadata
4. Deletes old memories if transcript is modified/deleted
