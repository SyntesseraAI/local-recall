---
id: c48a0065-4b5a-40e6-b1da-68dccdaaea9c
subject: Memory file format uses YAML frontmatter with specific metadata fields
keywords:
  - memory-format
  - yaml
  - metadata
  - id
  - subject
  - keywords
  - applies_to
  - occurred_at
  - content_hash
applies_to: global
occurred_at: '2025-12-02T17:27:43.703Z'
content_hash: bfe53b2f6e000e52
---
Each memory is a markdown file with YAML frontmatter containing: id (UUID), subject (brief description), keywords (array for searchability), applies_to (scope: global/file:/path/to/file/area:name), occurred_at (ISO-8601 timestamp), content_hash (SHA-256 prefix for deduplication). The actual memory content follows in markdown format below the frontmatter.
