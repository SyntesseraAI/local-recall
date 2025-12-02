---
id: 74d8d6df-8c1e-40a2-8c0d-0ae6dcbce5a7
subject: >-
  Transcript condensing extracts key events and removes verbose details for
  memory processing
keywords:
  - transcript
  - condensing
  - summarization
  - memory-extraction
  - efficiency
  - context-reduction
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T22:56:09.492Z'
content_hash: 1587079a3f7b7326
---
# Transcript Condensing

Transcript condensing is a technique used to extract the essential information from verbose Claude Code transcripts while maintaining meaningful context.

## Purpose

Transcripts can become very long and contain redundant information. Condensing extracts:
- User requests and questions
- Assistant explanations and decisions
- Tool invocations (name and key parameters)
- Results and outcomes
- Important code snippets

## Format

Condensed transcripts use a simplified event format:
- `[User]` - What the user asked
- `[Assistant]` - What Claude responded
- `[Tool: Name]` - Tool invocation with key details
- `[Result: OK/ERROR]` - Outcome

This condensed format is then used as input for memory extraction, making it more efficient to identify and extract valuable memories.
