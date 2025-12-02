---
id: 48fc8cec-a5d9-450e-b9ce-c9fad1fd7593
subject: 'Memory files are version-controlled, SQLite database and logs are gitignored'
keywords:
  - git
  - gitignore
  - version-control
  - persistence
applies_to: global
occurred_at: '2025-12-02T21:23:18.505Z'
content_hash: 1ab360278afd174a
---
Memory markdown files in local-recall/episodic-memory/ are tracked in git. However, local-recall/memory.sqlite (vector store), recall.log (debug log), and local_cache/ (embedding model) are auto-gitignored by local-recall/.gitignore.
