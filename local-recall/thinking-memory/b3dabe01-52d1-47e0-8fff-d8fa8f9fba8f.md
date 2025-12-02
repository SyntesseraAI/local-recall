---
id: b3dabe01-52d1-47e0-8fff-d8fa8f9fba8f
subject: >-
  The issue is `meaningful[0].slice(0, 500)` - TypeScript thinks `meaningful[0]`
  could be undefined...
applies_to: global
occurred_at: '2025-11-29T21:14:47.038Z'
content_hash: 03d15d87e896ef90
---
The issue is `meaningful[0].slice(0, 500)` - TypeScript thinks `meaningful[0]` could be undefined even though we already checked `meaningful.length > 0`. Let me add a guard for this.
