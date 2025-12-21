---
id: 4bfe03c7-5ef1-45fd-bb7a-a1da9e2d057e
subject: Debug logging added for memory search results in hooks
keywords:
  - logging
  - debug
  - hooks
  - memory search
  - similarity
applies_to: >-
  file:src/hooks/user-prompt-submit.ts|file:src/hooks/user-prompt-submit-thinking.ts
occurred_at: '2025-12-21T19:33:09.129Z'
content_hash: f8a377fd827fe768
---
When memories are searched in either hook, debug logs now include:
- Memory filename (e.g., `{id}.md`)
- Similarity score (e.g., `92%`)
- Memory subject/title (e.g., `"{subject}"`)

Format: `  - {id}.md | {similarity}% | "{subject}"`

This helps with debugging what memories are being retrieved and their relevance scores. Implemented in:
- `src/hooks/user-prompt-submit.ts` - for episodic memories
- `src/hooks/user-prompt-submit-thinking.ts` - for thinking memories

Logs are written using the logger.hooks interface.
