---
id: 805a6ebb-57b3-4dc6-ab7c-daa04f7aea2c
subject: Plugin version bumped from 0.1.1 to 0.1.2
keywords:
  - version
  - plugin
  - 0.1.2
  - release
  - package
applies_to: global
occurred_at: '2025-12-21T19:20:03.546Z'
content_hash: ebfc79fa29278ba8
---
The plugin version is managed in two files that must be kept in sync:
1. package.json - root package version
2. dev-marketplace/local-recall-plugin/.claude-plugin/plugin.json - plugin metadata

Both files must be updated together when bumping the version. The current version is 0.1.2 (bumped from 0.1.1).
