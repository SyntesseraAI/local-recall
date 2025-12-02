---
id: e0f67aec-6db4-4c30-b1f2-45dd94d9ffec
subject: Keyword extraction method for memory search using Claude Haiku
keywords:
  - keyword-extraction
  - claude-haiku
  - memory-search
  - prompt-analysis
  - extraction-method
applies_to: 'area:user-prompt-submit'
occurred_at: '2025-12-01T23:10:52.957Z'
content_hash: 2498b4e150becefa
---
# Keyword Extraction for Memory Search

The user-prompt-submit hook extracts keywords from user prompts using Claude Haiku to enable intelligent memory search.

## Method

Use the command: `claude -p --model haiku` to send a prompt to Claude Haiku and extract keywords

## Implementation Details

When a user submits a prompt:
1. The prompt text is passed to Claude Haiku
2. Haiku extracts relevant keywords from the prompt
3. These keywords are used to search the memory index via fuzzy matching
4. Matching memories are retrieved and injected into Claude's context

This allows the system to intelligently find relevant memories based on what the user is asking about, improving context awareness across sessions.
