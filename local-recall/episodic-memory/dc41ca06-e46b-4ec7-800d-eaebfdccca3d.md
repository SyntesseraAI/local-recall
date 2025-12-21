---
id: dc41ca06-e46b-4ec7-800d-eaebfdccca3d
subject: 'Gitignore updates: track JSONL memories but ignore index files'
keywords:
  - gitignore
  - jsonl
  - orama
  - processed-log
  - version-control
applies_to: 'file:local-recall/.gitignore'
occurred_at: '2025-12-21T19:03:33.302Z'
content_hash: b0ab51d6acf8677f
---
Updated .gitignore to track JSONL memory files (episodic-*.jsonl, thinking-*.jsonl) in git while ignoring Orama index files (orama-*.json), processed logs (processed-log.jsonl, thinking-processed-log.jsonl), and recall.log. This allows team members to share memories via git while keeping generated indexes and logs local.
