---
id: be3a5d7d-a6a9-45b3-b2b9-32b9cc8bcac9
subject: >-
  Now I see the issue. The memory extraction prompt doesn't have the
  `[LOCAL_RECALL_INTERNAL]`...
applies_to: global
occurred_at: '2025-11-30T14:57:07.313Z'
content_hash: 84fc6d78825fc72c
---
## Thought

Now I see the issue. The memory extraction prompt doesn't have the `[LOCAL_RECALL_INTERNAL]` prefix. The user-prompt-submit hook checks for prompts starting with `[LOCAL_RECALL_INTERNAL]` at line 161, but the memory extraction prompt starts with "You are analyzing a Claude Code session transcript".

Let me also check where this prompt is being used to understand the full picture, and find where the fix should be applied. Let me look at where this is called.

## Output

Now let me see where this prompt is actually sent to Claude - in the memory extractor:
