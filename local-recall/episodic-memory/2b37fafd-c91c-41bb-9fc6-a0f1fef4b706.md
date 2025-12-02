---
id: 2b37fafd-c91c-41bb-9fc6-a0f1fef4b706
subject: >-
  Memory files use directory structure episodic-memory instead of memories after
  refactoring
keywords:
  - episodic-memory
  - directory-structure
  - refactoring
  - git-tracked
applies_to: global
occurred_at: '2025-12-01T15:59:26.230Z'
content_hash: fd6fcd13603cf2a9
---
# Memory Directory Naming

Memory files are stored in `local-recall/episodic-memory/` (not `memories/`). This was standardized in recent commits as part of project refactoring.

Memory files in this directory are version-controlled and tracked in git, allowing memories to be shared across team members.
