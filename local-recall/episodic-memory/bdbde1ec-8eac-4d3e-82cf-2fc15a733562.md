---
id: bdbde1ec-8eac-4d3e-82cf-2fc15a733562
subject: 'ToolResultContent.content can be array of content blocks, not just string'
keywords:
  - transcript
  - tool-result
  - type-safety
  - content-blocks
  - bug
  - runtime
applies_to: 'file:src/core/transcript-condenser.ts'
occurred_at: '2025-12-20T22:38:28.607Z'
content_hash: 8276022f62e089fe
---
The TypeScript type definition for `ToolResultContent.content` is `string`, but Claude's actual transcript format can provide content as either a string OR an array of content blocks (for multi-part results like images + text).

This caused a runtime crash when calling `.toLowerCase()` on non-string content in the `isErrorResult()` function at line 205. The fix requires type guards to check if content is a string before calling string methods, or converting arrays to string representation.
