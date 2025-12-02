---
id: f72e3cc6-ad5f-4e29-ac5a-eeef5ece2777
subject: Memory search should handle empty keywords gracefully instead of failing
keywords:
  - search
  - empty keywords
  - error handling
  - memory-lifecycle test
applies_to: 'file:src/core/search.ts'
occurred_at: '2025-12-02T06:39:38.532Z'
content_hash: d938758404041df5
---
During testing of the memory lifecycle, the search functionality was called with empty keywords (when Claude CLI times out) and was either failing or returning unexpected results.

**Expected behavior**: When search is called with empty keywords, it should:
- Return an empty array (no matches found) rather than throwing an error
- Handle the edge case gracefully without crashing

**Implementation consideration**: The search logic needs to check for empty keywords early and return an empty result set rather than attempting fuzzy matching on nothing.
