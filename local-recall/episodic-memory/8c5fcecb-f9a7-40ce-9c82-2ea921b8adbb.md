---
id: 8c5fcecb-f9a7-40ce-9c82-2ea921b8adbb
subject: Important configuration and environment setup for Local Recall
keywords:
  - setup
  - configuration
  - npm-scripts
  - environment-variables
applies_to: global
occurred_at: '2025-12-02T21:13:14.069Z'
content_hash: 75d450562998fbd8
---
Key setup requirements:
- Node.js 18+, TypeScript 5.9+
- Run `npm install && npm run build` to compile TypeScript
- Environment variable: `LOCAL_RECALL_DIR` points to memory storage directory (default `./local-recall`)
- Configuration via `.local-recall.json` or environment variables
- MCP server started with `npm run mcp:start` or direct node command
- Development uses watch mode with `npm run dev`
