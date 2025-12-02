---
id: fdeed16a-5b9f-44d5-b7d9-effbe0453ef6
subject: >-
  Now I need to create the transcript condenser that will take the raw JSONL and
  produce a minimal...
applies_to: global
occurred_at: '2025-12-01T09:46:26.258Z'
content_hash: 5a709698188dc1d6
---
Now I need to create the transcript condenser that will take the raw JSONL and produce a minimal format. This will be a new file in `src/core/transcript-condenser.ts`.

The condensed format should:
1. For user messages: just show the text prompt
2. For assistant messages: show text responses (truncated if too long)
3. For tool uses: show tool name and description/key params only
4. For tool results: show success/error status and brief summary
5. Skip: thinking content, file-history-snapshot, queue-operation, full file contents, full bash outputs

Let me create a structured condensed format that's efficient for memory extraction.
