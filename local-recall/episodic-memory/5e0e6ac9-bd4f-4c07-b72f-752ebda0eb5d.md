---
id: 5e0e6ac9-bd4f-4c07-b72f-752ebda0eb5d
subject: >-
  Thinking memory retrieval now uses token-based limits instead of count-based
  limits
keywords:
  - thinking memory
  - retrieval
  - token limit
  - configurable
  - budget
applies_to: 'file:src/hooks/user-prompt-submit-thinking.ts'
occurred_at: '2025-12-21T19:14:59.463Z'
content_hash: 18d47f636b0a415c
---
Changed thinking memory retrieval from a fixed count (10 memories) to a token-based budget system that's configurable via environment variables.

Configuration:
- `LOCAL_RECALL_THINKING_MAX_TOKENS` (env var, default: 1000) - Maximum tokens of thinking memories to inject per prompt
- Added to config schema in `src/core/types.ts` and loaded in `src/utils/config.ts`
- Memories are added until hitting the token budget
- Also respects similarity threshold (default 80%, or 0.8)

This approach is more precise than count-based limiting because it ensures consistent context window usage regardless of memory size.
