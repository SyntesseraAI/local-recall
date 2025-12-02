---
id: 45c84fab-f7ec-4bab-a8eb-14fa35bc2a4b
subject: >-
  Memory file format uses YAML frontmatter with required fields: id, subject,
  keywords, applies_to, occurred_at, content_hash
keywords:
  - memory-format
  - markdown
  - yaml-frontmatter
  - metadata
applies_to: global
occurred_at: '2025-12-02T22:01:41.097Z'
content_hash: 2917de34494c5dff
---
Each memory is a markdown file with YAML frontmatter containing:
- `id`: UUID identifier
- `subject`: Brief one-line description
- `keywords`: Array of searchable terms
- `applies_to`: Scope (global, file:<path>, or area:<name>)
- `occurred_at`: ISO-8601 timestamp for deduplication
- `content_hash`: SHA-256 hash prefix (16 chars) for duplicate detection

Memory files are stored in `local-recall/episodic-memory/` and tracked in git.
