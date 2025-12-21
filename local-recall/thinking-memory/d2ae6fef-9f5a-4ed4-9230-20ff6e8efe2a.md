---
id: d2ae6fef-9f5a-4ed4-9230-20ff6e8efe2a
subject: >-
  I see. The `transcript` logger uses `createLoggerWithErrors`, but only the
  `error` method accepts...
applies_to: global
occurred_at: '2025-11-30T21:26:26.181Z'
content_hash: c5473c3df16a427f
---
## Thought

I see. The `transcript` logger uses `createLoggerWithErrors`, but only the `error` method accepts an error argument, not `warn`. Let me fix the code to just include the error info in the string or only pass one argument.

## Output

The `warn` method only takes one argument. Let me fix that:
