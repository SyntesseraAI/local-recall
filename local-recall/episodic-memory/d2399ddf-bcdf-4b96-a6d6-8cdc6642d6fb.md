---
id: d2399ddf-bcdf-4b96-a6d6-8cdc6642d6fb
subject: Memory files in local-recall/ are version-controlled and use YAML frontmatter
keywords:
  - memory
  - markdown
  - yaml
  - frontmatter
  - git
  - version-control
  - episodic-memory
applies_to: 'area:memory-storage'
occurred_at: '2025-12-02T12:53:59.119Z'
content_hash: 25d7900b44497da3
---
# Memory File Storage and Format

Memory files stored in `local-recall/episodic-memory/` are:
- **Version-controlled** - committed to git as part of the repository
- **Markdown format with YAML frontmatter** - structured metadata + content
- **Tracked by filename** - UUID-based identifiers

## Important Distinction

- Memory files themselves (`.md` in episodic-memory/) are committed to git
- The SQLite database (`memory.sqlite`) is gitignored and auto-generated
- Vector embeddings are computed from memory files on-demand

This design allows memories to be shared across team members while keeping the vector index local to each machine.
