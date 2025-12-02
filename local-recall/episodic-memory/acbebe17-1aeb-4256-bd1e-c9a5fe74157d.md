---
id: acbebe17-1aeb-4256-bd1e-c9a5fe74157d
subject: Session-start and stop hooks are built and available in dist/hooks/ directory
keywords:
  - hooks
  - build
  - distribution
  - session-start
  - stop
applies_to: global
occurred_at: '2025-12-01T16:28:13.714Z'
content_hash: 5fcf7276718ecad7
---
The hooks source files (session-start.ts and stop.ts) in src/hooks/ are compiled to dist/hooks/ directory. The built hooks are available and can be executed directly. This is verified by checking that the dist/hooks/ directory contains the compiled JavaScript files.
