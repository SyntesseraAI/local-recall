---
id: cfb408da-9b0a-4b15-b7bc-425bfdc543bb
subject: Memory tools are the primary interface for MCP server interactions
keywords:
  - mcp
  - tools
  - interface
  - memory management
  - mcp-server
applies_to: 'file:src/mcp-server/tools.ts'
occurred_at: '2025-12-01T15:58:15.547Z'
content_hash: 0d1750dd44bc1ea2
---
The `src/mcp-server/tools.ts` file contains the complete implementation of MCP tools including memory_create, memory_delete, memory_search, memory_list, and index_rebuild. These tools form the public API of the MCP server for memory operations and are the primary way external clients interact with the Local Recall system.
