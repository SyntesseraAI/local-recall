---
id: b7ac9ade-653e-43cc-a449-e2facdc91f44
subject: >-
  The user wants me to implement a solution where the hooks communicate with the
  MCP daemon instead...
applies_to: global
occurred_at: '2025-12-03T09:51:41.411Z'
content_hash: 40d5b96bb26bcc5d
---
## Thought

The user wants me to implement a solution where the hooks communicate with the MCP daemon instead of loading sqlite-vec directly. This will prevent the mutex errors.

Let me plan this out:

1. **Add HTTP server to MCP daemon** - Expose search endpoints on localhost
2. **Create a shared client module** - For hooks to call the daemon
3. **Modify hooks** - Replace direct database access with HTTP calls to daemon
4. **Handle daemon not running** - Graceful fallback or error

Let me think about the implementation details:

### HTTP Server in Daemon
- Use Node.js built-in `http` module (no extra deps)
- Listen on a configurable port (default: something unlikely to conflict)
- Endpoints:
  - `POST /search/episodic` - Search episodic memories
  - `POST /search/thinking` - Search thinking memories
  - `GET /health` - Check if daemon is running

### Hook Client
- Simple HTTP client using Node.js fetch or http module
- Timeout handling
- Graceful error handling if daemon not running

### Port Selection
- Use a fixed port or write port to a file
- Port file approach is more flexible but adds complexity
- Let's use a fixed port with env var override: `LOCAL_RECALL_PORT` default `19842`

Let me create a todo list and start implementing.

## Output

I'll implement this architecture where the daemon exposes an HTTP API and hooks become thin clients.
