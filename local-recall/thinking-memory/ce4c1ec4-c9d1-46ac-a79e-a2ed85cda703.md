---
id: ce4c1ec4-c9d1-46ac-a79e-a2ed85cda703
subject: >-
  The user wants to create a new hook for `UserPromptSubmit` that: 1. Takes the
  user's prompt 2....
applies_to: global
occurred_at: '2025-11-29T22:30:09.275Z'
content_hash: 05728bc57296b0db
---
## Thought

The user wants to create a new hook for `UserPromptSubmit` that:
1. Takes the user's prompt
2. Extracts keywords from it
3. Searches for relevant memories using those keywords
4. Adds matching memories to the context

Let me first understand the current hook structure and how hooks work. I should look at the existing hooks (session-start.ts and stop.ts) to understand the pattern, and also fetch the Claude Code hooks documentation to understand the UserPromptSubmit hook specifically.

Let me plan this out:
1. Read the existing hooks to understand the pattern
2. Fetch the hooks documentation to understand UserPromptSubmit
3. Create the new hook
4. Update hooks.json to register it
5. Update the build configuration if needed

Let me start by reading the existing hooks and fetching the documentation.

## Output

I'll help you create a `UserPromptSubmit` hook. Let me first look at the existing hooks to understand the pattern, and fetch the documentation for the hook format.
