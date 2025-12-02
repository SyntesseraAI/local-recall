---
id: 1fad5abe-eef6-45da-a24f-4c06a8eed167
subject: Memory extraction guidelines prioritize specificity and actionability
keywords:
  - extraction
  - guidelines
  - specificity
  - actionability
  - scope
  - memory
applies_to: global
occurred_at: '2025-12-02T01:37:34.005Z'
content_hash: fb2a687641b621a6
---
# Memory Extraction Guidelines

## DO Extract

- Architectural decisions and their reasoning
- Bug fixes and root cause analysis
- Code patterns or conventions specific to the project
- Configuration quirks or gotchas
- User preferences discovered during sessions
- Important relationships between components
- Performance considerations or optimizations

## DO NOT Extract

- Generic programming knowledge
- Temporary debugging steps
- Obvious or trivial information
- Sensitive data (API keys, passwords, personal info)
- Information that would become outdated quickly

## Scope Selection

Choose the appropriate scope for each memory:
- `global` - Applies to entire codebase (architecture, conventions, preferences)
- `file:<path>` - Specific to a particular file
- `area:<name>` - Related to a component or area

## Quality Requirements

Memories should be:
- **Specific**: Include file paths, function names, concrete details
- **Concise**: Focus on one concept or discovery per memory
- **Actionable**: Help future assistants avoid mistakes or work more efficiently
