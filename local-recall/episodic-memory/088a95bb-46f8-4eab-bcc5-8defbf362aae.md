---
id: 088a95bb-46f8-4eab-bcc5-8defbf362aae
subject: Unified UserPromptSubmit hook replaces separate episodic and thinking hooks
keywords:
  - hook consolidation
  - user-prompt-submit
  - unified
  - episodic
  - thinking
applies_to: global
occurred_at: '2025-12-21T19:00:54.454Z'
content_hash: 43cde8d156312b06
---
Merged `src/hooks/user-prompt-submit.ts` and `src/hooks/user-prompt-submit-thinking.ts` into a single unified hook (`src/hooks/user-prompt-submit.ts`) that intelligently calls either episodic memory search, thinking memory search, or both based on environment variable configuration. This simplifies hook setup and allows users to control which memory types are active.
