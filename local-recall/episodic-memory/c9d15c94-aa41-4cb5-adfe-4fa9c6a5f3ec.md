---
id: c9d15c94-aa41-4cb5-adfe-4fa9c6a5f3ec
subject: >-
  Claude project transcripts stored at ~/.claude/projects/ with path-based
  folder naming
keywords:
  - claude
  - transcripts
  - projects
  - path-based
  - macos
  - transcript-collector
  - file-path
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T06:27:58.195Z'
content_hash: 23cd47acc5120316
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute working directory path:
- Slashes (`/`) are replaced with underscores (`_`)
- The leading underscore from the initial `/` is preserved
- Example: `/Users/joe/Code/Syntessera/local-recall` becomes `_Users_joe_Code_Syntessera_local-recall`

## Transcript Files

Transcripts are stored as JSONL files (one JSON object per line) in `~/.claude/projects/<project-folder>/transcripts/`.

## Implications for Memory Extraction

When implementing transcript collection in Local Recall, the transcript-collector must:
1. Build the expected path by converting the current working directory (received via stdin)
2. Replace slashes with underscores to construct the correct folder name
3. Look for JSONL files in the transcripts subdirectory
4. Parse each line as individual JSON objects representing transcript events
