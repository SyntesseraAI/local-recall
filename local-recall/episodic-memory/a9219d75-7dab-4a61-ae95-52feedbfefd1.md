---
id: a9219d75-7dab-4a61-ae95-52feedbfefd1
subject: Transcript search uses path hashing to find project folder in Claude's cache
keywords:
  - transcript
  - collector
  - claude
  - projects
  - path
  - hash
  - fallback
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-21T19:31:43.723Z'
content_hash: 651cc00422b6d896
---
The transcript collector uses a three-tier search strategy to find the correct project folder in `~/.claude/projects/`:

1. **Primary approach**: Hash the project path and use it as the folder name (Claude's standard naming convention)
2. **Fallback**: If primary fails, scan all directories in Claude projects and check for matching projects
3. **Last resort**: Look for directories ending with the project name as substring

This handles cases where the expected folder structure isn't found by trying multiple lookup strategies.
