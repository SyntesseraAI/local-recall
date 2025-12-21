---
id: b8ac7afb-7b4a-4d5b-b1ba-aa0a3637c848
subject: sqlite-vec requires explicit k parameter in vector similarity queries
keywords:
  - sqlite-vec
  - query
  - limit
  - vector-search
  - k-parameter
applies_to: 'file:src/core/vector-store.ts'
occurred_at: '2025-12-21T18:17:55.902Z'
content_hash: 13695186cf295fda
---
sqlite-vec extension requires 'k = ?' parameter in the match() function for JOIN queries. When combining vector similarity with WHERE filters (like scope), the k limit is applied before the JOIN, so some matching vectors may be excluded. Solution: fetch k results without WHERE filter, then filter results in JavaScript code.
