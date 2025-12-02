---
id: faba80b2-e5eb-4afa-a1c3-c2bbf770aebb
subject: Memory file structure uses YAML frontmatter with specific required fields
keywords:
  - memory-format
  - yaml-frontmatter
  - metadata
  - structure
applies_to: global
occurred_at: '2025-12-01T22:35:45.342Z'
content_hash: 325d531a6119376f
---
Memory files use YAML frontmatter with these required fields:
- `id`: UUID for unique identification
- `subject`: Brief one-line description (max 200 chars)
- `keywords`: Array of searchable keywords (lowercase, specific)
- `applies_to`: Scope string (global, file:<path>, or area:<name>)
- `occurred_at`: ISO-8601 timestamp for deduplication and sorting
- `content_hash`: SHA-256 hash prefix (16 chars) for deduplication

Memory content follows the frontmatter as markdown. Files are stored in `local-recall/episodic-memory/` and tracked in git.
