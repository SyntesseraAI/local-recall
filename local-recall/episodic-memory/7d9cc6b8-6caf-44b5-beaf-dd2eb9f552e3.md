---
id: 7d9cc6b8-6caf-44b5-beaf-dd2eb9f552e3
subject: Keyword extraction is a core memory extraction requirement
keywords:
  - keywords
  - extraction
  - search
  - indexing
  - memory
  - feature
applies_to: global
occurred_at: '2025-12-02T07:50:41.482Z'
content_hash: 2774d13693a91550
---
# Keyword Extraction for Memory System

The Local Recall system relies on keyword extraction to make memories searchable and discoverable.

## Current Implementation

The `user-prompt-submit.ts` hook uses Claude Haiku to extract keywords from user prompts:
- Keywords are extracted before searching the memory index
- Used to perform fuzzy matching against indexed memory keywords
- Essential for relevant memory retrieval during sessions

## Future Enhancement

Memory extraction from transcripts should also extract keywords automatically from each memory's content, not just from user prompts. This would improve discoverability and cross-linking of memories created during sessions.
