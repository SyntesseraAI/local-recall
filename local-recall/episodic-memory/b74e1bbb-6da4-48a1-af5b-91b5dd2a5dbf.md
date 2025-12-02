---
id: b74e1bbb-6da4-48a1-af5b-91b5dd2a5dbf
subject: Keyword extraction for memory search using Claude API
keywords:
  - keywords
  - extraction
  - claude-api
  - memory-search
  - prompt-parsing
  - llm
applies_to: 'area:user-prompt-submit'
occurred_at: '2025-12-02T06:46:08.024Z'
content_hash: 55b3636803939b57
---
# Keyword Extraction for Memory Search

The user-prompt-submit hook extracts keywords from user prompts using the Claude API to improve memory search accuracy.

## Implementation Details

- Uses `claude -p --model haiku` command to invoke Claude Haiku for keyword extraction
- Receives the user prompt as input
- Returns keywords as a JSON array of strings
- Keywords are fuzzy-matched against the memory index to find relevant memories

## Purpose

Keyword extraction helps the memory system understand the semantic intent of user prompts, enabling more relevant memory retrieval than simple text matching would provide. This is more intelligent than naive keyword extraction and helps surface contextually relevant memories.

## Location

Implemented in `src/hooks/user-prompt-submit.ts`
