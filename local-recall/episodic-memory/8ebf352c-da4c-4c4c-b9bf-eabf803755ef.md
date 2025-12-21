---
id: 8ebf352c-da4c-4c4c-b9bf-eabf803755ef
subject: sqlite-vec extension requires 'k = ?' parameter in JOIN queries
keywords:
  - sqlite-vec
  - vector-search
  - query
  - limit
  - performance
applies_to: 'file:src/core/vector-store.ts'
occurred_at: '2025-12-21T19:15:15.466Z'
content_hash: 78ef7f80eb794713
---
The sqlite-vec extension requires explicit `k = ?` in the JOIN clause for vector similarity queries. When filtering by scope, the k limit must be applied as a parameter in the SQL. If scope filtering is needed, retrieve more results and filter in JavaScript code after the vector search, since sqlite-vec applies k before WHERE clauses take effect.
