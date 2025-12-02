---
id: 33df19cb-6960-4a64-ada9-bfcdaadd9f6d
subject: >-
  The fix uses optional chaining `codeBlockMatch?.[1]` to ensure both the match
  exists and the...
applies_to: global
occurred_at: '2025-11-30T20:53:11.641Z'
content_hash: 5fbb7077037a66e1
---
The fix uses optional chaining `codeBlockMatch?.[1]` to ensure both the match exists and the capture group at index 1 exists before accessing it. Let me verify the build passes now.
