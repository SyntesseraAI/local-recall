---
id: fe94c467-07af-4ffd-a48a-ecb0f49e0f3f
subject: >-
  Claude project transcripts stored in ~/.claude/projects/ with path-derived
  folder names
keywords:
  - claude
  - transcripts
  - projects
  - file-path
  - macos
  - transcript-collector
  - directory-structure
applies_to: global
occurred_at: '2025-12-01T16:22:35.411Z'
content_hash: c2794a0304bec2d1
---
# Claude Project Transcripts Location

Claude Code stores project transcripts at `~/.claude/projects/` on macOS.

## Path Format

The project folder name is derived from the absolute project path using a specific encoding scheme.

For a project at `/Users/joe/Code/Syntessera/local-recall`, Claude creates:
- Base folder: `~/.claude/projects/`
- Project folder name encoding: Path components are separated by `/` and the path is URL-encoded or hashed
- Full path: `~/.claude/projects/<encoded-path>/`

## Directory Structure

Within each project folder:
- `transcripts/` - Contains individual session transcripts
- Each transcript is named with timestamps or session identifiers
- Transcripts are JSON files containing the full conversation history

## Usage in Local Recall

The transcript-collector needs to know this location to:
1. Find and parse Claude Code transcripts
2. Extract memories from completed sessions
3. Sync transcript data with the memory system
4. Track which transcripts have been processed using content hashes

## Implementation Detail

When implementing transcript collection, the path resolution should:
1. Accept the project's working directory as input
2. Convert it to the Claude projects folder name using the same encoding
3. Look for transcripts in `~/.claude/projects/<encoded-name>/transcripts/`
4. Parse JSON transcript files
5. Use content hashing to detect when transcripts have changed
