---
id: af372621-ddf2-4d9c-8c1a-cdf50feee03a
subject: Memories must have specific frontmatter structure with required fields
keywords:
  - memory format
  - yaml frontmatter
  - memory fields
  - content hash
applies_to: global
occurred_at: '2025-12-01T15:54:48.067Z'
content_hash: eb3e32f97cd6ad41
---
Each memory file requires YAML frontmatter with: id (UUID), subject, keywords (array), applies_to (scope), occurred_at (ISO-8601), and content_hash (SHA-256 prefix). The content_hash is used for deduplication to prevent duplicate memories from being created.
