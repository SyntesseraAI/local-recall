---
id: 0abf7cdb-176d-42bb-a703-0aadd3e40f4c
subject: >-
  Project structure separates concerns with src/core, src/prompts, src/hooks
  directories
keywords:
  - architecture
  - project structure
  - separation of concerns
  - modules
applies_to: global
occurred_at: '2025-12-01T16:04:32.820Z'
content_hash: ea81e9de820be4e0
---
The local-recall project uses a clear directory structure that separates:
- src/core/ - Core memory management functionality
- src/prompts/ - Prompt templates and prompt engineering
- src/hooks/ - Claude Code hook implementations
- src/mcp-server/ - MCP server functionality
- src/utils/ - Utility functions

This separation makes the codebase maintainable and allows different components to be developed independently.
