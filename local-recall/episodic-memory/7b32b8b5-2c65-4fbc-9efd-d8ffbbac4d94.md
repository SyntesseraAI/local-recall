---
id: 7b32b8b5-2c65-4fbc-9efd-d8ffbbac4d94
subject: >-
  Claude transcript files are located in ~/.claude/projects with URL-encoded
  project paths
keywords:
  - claude
  - transcript
  - projects
  - file-location
  - jsonl
  - path-encoding
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:21:53.228Z'
content_hash: fcab2b1d82841002
---
Claude Code stores session transcripts in `~/.claude/projects/` with a specific naming convention:

- Project directories use URL-encoded paths with dashes replacing slashes
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `Users-joe-Code-Syntessera-local-recall`
- Transcript files are stored as JSONL format in `~/.claude/projects/{encoded-path}/transcripts/`
- Each session has a unique transcript file with format like `{session-id}.jsonl`
- Transcripts contain JSON objects with keys: `type` (e.g., 'user', 'assistant', 'tool_call'), `content`, `timestamp`

This is important for the transcript-collector feature that needs to sync and process Claude's session history.
