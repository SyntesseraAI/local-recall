---
id: ac6c4dfa-0bcb-488c-b8bd-2db733f00c67
subject: >-
  The vector-store.ts is now using Orama (pure JavaScript), not sqlite-vec. So
  the main VectorStore...
applies_to: global
occurred_at: '2025-12-03T11:19:43.387Z'
content_hash: c00bdaec80aebcf1
---
## Thought

The vector-store.ts is now using Orama (pure JavaScript), not sqlite-vec. So the main VectorStore is fine.

But wait - let me check the embedding service. The mutex error mentions sqlite, and I noticed it still uses `fastembed` which might have native dependencies. Let me check the embedding.ts file.

## Output

The vector store uses Orama. Let me check the embedding service - `fastembed` might have native dependencies:
