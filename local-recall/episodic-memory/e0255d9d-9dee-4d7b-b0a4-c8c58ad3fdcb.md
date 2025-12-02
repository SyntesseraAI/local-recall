---
id: e0255d9d-9dee-4d7b-b0a4-c8c58ad3fdcb
subject: Memory file format uses YAML frontmatter with specific metadata fields
keywords:
  - memory format
  - yaml frontmatter
  - metadata
  - markdown
  - id
  - subject
  - keywords
  - applies_to
  - occurred_at
  - content_hash
applies_to: global
occurred_at: '2025-12-01T16:04:07.483Z'
content_hash: 58f2d075327cf62f
---
Memory files are stored as markdown with YAML frontmatter. Required fields:
- `id`: UUID unique identifier
- `subject`: One-line brief description
- `keywords`: Array of searchable keywords
- `applies_to`: Scope (global, file:<path>, or area:<name>)
- `occurred_at`: ISO-8601 timestamp for deduplication and sorting
- `content_hash`: SHA-256 hash prefix (16 chars) for deduplication

The actual memory content follows the frontmatter in markdown format.
