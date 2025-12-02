---
id: 14ddacd5-e39d-47ee-ac60-afe6cec81a9c
subject: Fuzzy search implementation with threshold configuration
keywords:
  - fuzzy search
  - keyword matching
  - threshold
  - search.ts
  - configuration
applies_to: 'file:src/core/search.ts'
occurred_at: '2025-12-01T22:25:48.966Z'
content_hash: 39f2a5e9e31be3df
---
The fuzzy search implementation in `search.ts` uses a configurable threshold (default 0.6) to determine match quality. This threshold can be adjusted via configuration to balance between precision (higher threshold = more exact matches) and recall (lower threshold = more results). The fuzzy matching is used for both keyword and subject searches.
