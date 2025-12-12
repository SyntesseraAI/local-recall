---
id: ebd6f5cb-7a92-448c-8d4d-bade685fc8d5
subject: >-
  Now I can answer the question accurately. The daemon does run on startup: 1.
  **Vector sync**: Runs...
applies_to: global
occurred_at: '2025-12-12T10:03:35.109Z'
content_hash: b1686107cec6b1c4
---
## Thought

Now I can answer the question accurately. The daemon does run on startup:

1. **Vector sync**: Runs immediately on startup (after 2 second delay for server initialization) - lines 169-180
2. **Transcript processing**: Runs on startup (after 5 second delay) - lines 182-193
3. Then both continue on periodic intervals (5 minutes for transcripts, 10 minutes for vector sync)

So yes, the daemon runs on startup - it doesn't wait for the first interval. It just has a short delay (2-5 seconds) to let the MCP server initialize first.

## Output

Yes. The daemon runs on startup with short delays:

1. **Vector sync**: Runs 2 seconds after server start (then every 10 minutes)
2. **Transcript processing**: Runs 5 seconds after server start (then every 5 minutes)

From `src/mcp-server/server.ts:169-193`:
```typescript
// Run initial vector syncs immediately on startup (after short delay for server init)
setTimeout(() => { ... }, 2000);

// Run initial transcript processing after a short delay
setTimeout(() => { ... }, 5000);
```

So when the MCP server starts, it immediately kicks off the daemon - it doesn't wait for the first 5-minute interval.
