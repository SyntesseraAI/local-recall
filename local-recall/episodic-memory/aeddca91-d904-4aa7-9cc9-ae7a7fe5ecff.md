---
id: aeddca91-d904-4aa7-9cc9-ae7a7fe5ecff
subject: Memory extraction process and keyword identification
keywords:
  - memory-extraction
  - keywords
  - claude-haiku
  - prompt-submission
  - subject
  - content
applies_to: global
occurred_at: '2025-12-01T15:56:31.301Z'
content_hash: 2d20529445e27cf2
---
# Memory Extraction Process

The system uses Claude Haiku to extract keywords from user prompts during the UserPromptSubmit hook. This enables semantic search across memories.

## Process

1. User submits a prompt in Claude Code
2. UserPromptSubmit hook is triggered
3. Hook sends prompt to Claude Haiku with instructions to extract keywords
4. Returned keywords are used to search the memory index
5. Matching memories are injected into Claude's context

## Key Points

- Keywords should be lowercase and specific
- The memory extraction process itself should identify both explicit and implicit topics
- Subject lines should be brief (max 200 chars) one-line descriptions
- Each memory focuses on one concept or discovery
- Content should be actionable and help future assistants avoid mistakes
