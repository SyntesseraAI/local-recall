---
id: 5c05e0b9-8f88-4ec7-aeaf-cc0aa8970bba
subject: >-
  Memory deduplication uses occurred_at timestamp and content_hash to prevent
  duplicate memories
keywords:
  - deduplication
  - duplicate
  - occurred_at
  - content_hash
  - idempotent
applies_to: global
occurred_at: '2025-12-01T15:58:18.207Z'
content_hash: 8fcf10d58978cc10
---
Local Recall uses a deduplication mechanism to prevent storing duplicate memories:

- **occurred_at field**: ISO-8601 timestamp indicating when the original event occurred (used for time-based deduplication and sorting)
- **content_hash field**: SHA-256 hash prefix (16 characters) of the memory content
- **findDuplicate() method**: Checks for existing duplicates using occurred_at and content_hash before creating new memories
- **Idempotent behavior**: Creating a memory with the same occurred_at and content_hash returns the existing memory instead of creating a duplicate

This ensures memories remain unique and prevents accumulation of redundant information over time.
