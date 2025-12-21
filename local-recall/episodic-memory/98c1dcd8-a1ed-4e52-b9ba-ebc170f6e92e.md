---
id: 98c1dcd8-a1ed-4e52-b9ba-ebc170f6e92e
subject: >-
  Claude Code transcript format has content as array of blocks with thinking
  extraction
keywords:
  - transcript
  - thinking
  - content blocks
  - parsing
  - claude code format
applies_to: 'file:src/utils/transcript.ts'
occurred_at: '2025-12-21T18:29:39.576Z'
content_hash: 34d991f9e8c5960c
---
Claude Code transcripts have a different structure than initially expected:

- `content` is an **array of content blocks**, not a string
- Thinking blocks have `type: "thinking"` with a `thinking` field
- Text blocks have `type: "text"` with a `text` field
- Tool blocks have `type: "tool_use"` or `type: "tool_result"`

The `parseTranscript` function now extracts thinking from content blocks during parsing and normalizes it into a `thinking` field on the normalized message object. This allows the rest of the codebase to work with the same structure regardless of whether thinking is present.

Implementation uses backward-compatible detection:
1. First tries new format (check for `content` array with blocks)
2. Falls back to legacy format (check for `content` string)
3. Silently skips invalid messages instead of throwing errors

See `src/core/types.ts` for `RawTranscriptMessage` and content block types.
