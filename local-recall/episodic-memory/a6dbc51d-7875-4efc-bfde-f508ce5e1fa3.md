---
id: a6dbc51d-7875-4efc-bfde-f508ce5e1fa3
subject: Memory extraction goal and scope for local-recall project
keywords:
  - memory-extraction
  - transcript-analysis
  - local-recall
  - goals
  - scope
  - claude-sessions
applies_to: global
occurred_at: '2025-12-01T16:33:28.868Z'
content_hash: e1bcaa137330398b
---
# Memory Extraction Goals

The local-recall project extracts memories from Claude Code session transcripts to help future AI assistants working on the codebase.

## What Should Be Extracted

- Architectural decisions and their reasoning
- Bug fixes and root cause analysis
- Code patterns or conventions specific to the project
- Configuration quirks or gotchas
- User preferences discovered during sessions
- Important relationships between components
- Performance considerations or optimizations applied

## What Should NOT Be Extracted

- Generic programming knowledge
- Temporary debugging steps
- Obvious or trivial information
- Sensitive data (API keys, passwords, personal info)
- Information that would become outdated quickly

## Scope Guidelines

- Use `global` scope for codebase-wide knowledge
- Use `file:<path>` for file-specific information
- Use `area:<name>` for component or feature-specific information

## Memory Characteristics

Good memories are:
- **Specific**: Include file paths, function names, concrete details
- **Concise**: Focus on one concept or discovery
- **Actionable**: Help future assistants avoid mistakes or work more efficiently
