---
id: e8ae759e-f481-4e5d-af22-c889ebf6cdcd
subject: Marketplace plugin file is out of date at 0.1.6 while local version is 0.1.9
keywords:
  - marketplace
  - plugin
  - version
  - update
  - deployment
applies_to: global
occurred_at: '2025-12-21T19:04:30.207Z'
content_hash: 5152c9826c50873f
---
The local-recall plugin on the marketplace is at version 0.1.6, but the local codebase has been updated to version 0.1.9. The `.claude-plugin/marketplace.json` file needs to be updated and deployed to reflect the current version. This is a separate publishing step from the npm package.
