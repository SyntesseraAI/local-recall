---
id: c1fea1f5-a77e-4fd5-afb2-af922baa83f8
subject: >-
  Memory files are version-controlled and stored in
  local-recall/episodic-memory/
keywords:
  - memory
  - files
  - git
  - version-control
  - episodic-memory
  - markdown
  - frontmatter
applies_to: 'area:memory-storage'
occurred_at: '2025-12-01T16:27:41.043Z'
content_hash: 63a6fd140b599cbd
---
# Memory File Storage and Version Control

## Storage Location

Memory files are stored in `local-recall/episodic-memory/` as markdown files with YAML frontmatter.

## Version Control

- Memory files ARE version-controlled and committed to git
- This makes them shareable among team members
- The `local-recall/.gitignore` file excludes `index.json` and `recall.log` (auto-generated)

## File Format

Each memory is a markdown file with YAML frontmatter containing:
- `id` - UUID identifier
- `subject` - One-line description
- `keywords` - Array of searchable keywords
- `applies_to` - Scope (global, file:<path>, or area:<name>)
- `occurred_at` - ISO-8601 timestamp
- `content_hash` - SHA-256 hash prefix (16 chars) for deduplication

## Important Notes for Development

- Use provided tools rather than direct file manipulation
- New memories should have relevant, specific keywords
- Consider scope carefully when creating memories
- Memories are idempotent - creating a duplicate returns the existing memory
