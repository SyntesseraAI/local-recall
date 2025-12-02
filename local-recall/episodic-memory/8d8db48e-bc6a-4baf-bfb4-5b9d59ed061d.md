---
id: 8d8db48e-bc6a-4baf-bfb4-5b9d59ed061d
subject: >-
  LOCAL_RECALL_INTERNAL marker indicates the message is a memory extraction
  request from the MCP server
keywords:
  - internal-message
  - mcp-server
  - memory-extraction-trigger
applies_to: global
occurred_at: '2025-12-02T02:05:25.426Z'
content_hash: deb6fed2fbf07ba6
---
Messages prefixed with `[LOCAL_RECALL_INTERNAL]` indicate they are memory extraction requests from the MCP server daemon. These messages provide the transcript analysis context and expect JSON output with extracted memories. The format includes project context (working directory), transcript format explanation, task description, and guidelines.
