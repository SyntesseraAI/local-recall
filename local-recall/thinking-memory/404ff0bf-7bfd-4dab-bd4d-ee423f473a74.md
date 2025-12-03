---
id: 404ff0bf-7bfd-4dab-bd4d-ee423f473a74
subject: >-
  Now I understand the issue. The mutex error is happening in the sqlite-vec or
  better-sqlite3 layer....
applies_to: global
occurred_at: '2025-12-02T22:14:26.948Z'
content_hash: 9bd4164dcb0a3cea
---
## Thought

Now I understand the issue. The mutex error is happening in the sqlite-vec or better-sqlite3 layer. This could be caused by:

1. **Concurrent access**: Both the regular `user-prompt-submit.ts` hook and the `user-prompt-submit-thinking.ts` hook might be running simultaneously and both trying to access the same `memory.sqlite` file.

2. **Singleton conflict**: The thinking vector store and regular vector store both use `memory.sqlite` (same file), and they each maintain their own singleton instances. If both hooks run at the same time, they could both try to open/lock the same database file.

Looking at the code:
- `thinking-vector-store.ts:18`: `const DB_FILENAME = 'memory.sqlite';`
- Both vector stores share the same database file but have separate singleton instances

This is a classic database locking issue. When two processes try to open the same SQLite file with `better-sqlite3`, and especially when using the `sqlite-vec` extension, you can get mutex/locking errors.

The key issue is that hooks run as separate processes - each hook invocation spawns a new Node.js process. So you have:
1. `user-prompt-submit.js` - opens memory.sqlite
2. `user-prompt-submit-thinking.js` - tries to open the same memory.sqlite

SQLite with WAL mode should handle this, but the sqlite-vec extension might have issues with concurrent access, especially during initialization.

Solutions:
1. **Combine the hooks** - Have one hook do both episodic and thinking searches
2. **Use separate database files** for thinking memories
3. **Add retry logic with delay** when opening the database
4. **Use a lock file** to serialize access
5. **Configure SQLite busy timeout** properly

Let me check if the hooks are configured to run in parallel and if there's any busy timeout configuration.

## Output

The issue is clear now. Both hooks run as **separate processes** and try to access the same `memory.sqlite` file:

- `user-prompt-submit.js` → opens `memory.sqlite` via `VectorStore`
- `user-prompt-submit-thinking.js` → opens `memory.sqlite` via `ThinkingVectorStore`

When both hooks fire simultaneously on user prompt submit, they create a race condition where both try to initialize/lock the same SQLite database. The `sqlite-vec` extension's native mutex handling fails under concurrent access from separate processes.

**Potential solutions:**

1. **Combine the hooks** - Have one hook do both episodic and thinking searches (cleanest)
2. **Use separate database files** - `memory.sqlite` and `thinking-memory.sqlite`
3. **Add SQLite busy timeout** - Configure `better-sqlite3` to wait on lock

Would you like me to implement one of these fixes? I'd recommend option 1 (combining hooks) as it's the most efficient - only one DB initialization per prompt, cleaner architecture, and avoids the concurrency issue entirely.
