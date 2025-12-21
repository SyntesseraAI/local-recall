---
id: de2c2f6e-6ef4-4e31-8c14-f7ae4e7ca1fb
subject: Transcript search uses multiple fallback strategies to find Claude projects
keywords:
  - transcript-collector
  - fallback
  - path-resolution
  - claude-projects
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-21T19:30:16.754Z'
content_hash: 9dcf8ae8d74acc8c
---
The transcript collector uses a multi-strategy approach to locate Claude project transcripts:

1. **Primary**: Looks for transcripts at `~/.claude/projects/<path-to-project>/transcripts/` where the path is derived from the current working directory
2. **Fallback 1**: Scans all directories in `~/.claude/projects/` to find matching transcripts
3. **Fallback 2**: Checks for directories ending with specific pattern matches

This defensive approach handles cases where the project path encoding may differ or the Claude projects directory structure is non-standard. The fallback strategies ensure transcripts are found even with unusual path configurations.
