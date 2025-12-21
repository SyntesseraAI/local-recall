---
id: 8ccd16e4-1feb-4df2-9ba5-ba8d9331caa9
subject: >-
  User preference: Multiple Claude instances must be supported without shared
  daemon constraint
keywords:
  - user-preference
  - requirements
  - multiple-instances
  - architecture-decision
applies_to: global
occurred_at: '2025-12-21T19:19:54.289Z'
content_hash: eedd559e5541e962
---
The user explicitly does not want a single shared daemon architecture because it would prevent running multiple Claude instances simultaneously. This is a hard constraint on the solution.

**Context**: Initial suggestion of an HTTP daemon within MCP server was rejected because multiple Claude instances would each need their own daemon, which recreates the concurrency problem. Any solution must allow N concurrent Claude instances without architectural conflicts.
