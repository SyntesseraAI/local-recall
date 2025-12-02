---
id: fd0efaea-74ab-46ad-9351-bfc4e964bfd9
subject: Memory extraction task - analyzing transcripts to create actionable memories
keywords:
  - memory-extraction
  - transcript-analysis
  - keywords
  - json-format
  - semantic
applies_to: 'area:memory-extractor'
occurred_at: '2025-12-02T21:53:40.964Z'
content_hash: 2435317573baaf2e
---
# Memory Extraction Guidelines

## Task Overview

The system extracts valuable memories from Claude Code session transcripts to help future AI assistants working on the codebase.

## Key Principles

1. **Specificity**: Include file paths, function names, concrete details
2. **Conciseness**: One concept per memory
3. **Actionability**: Help future assistants avoid mistakes or work efficiently
4. **Appropriate Scope**:
   - `global` - entire codebase (architecture, conventions, preferences)
   - `file:<path>` - specific file
   - `area:<name>` - component/feature area

## What to Extract

DO extract:
- Architectural decisions and reasoning
- Bug fixes and root cause analysis
- Code patterns and conventions
- Configuration quirks and gotchas
- User preferences
- Component relationships
- Performance optimizations

DO NOT extract:
- Generic programming knowledge
- Temporary debugging steps
- Obvious/trivial information
- Sensitive data
- Quickly outdated information

## Output Format

JSON object with memories array. Each memory has:
- `subject`: Brief one-line description (max 200 chars)
- `keywords`: Array of 1-10 searchable keywords (lowercase, specific)
- `applies_to`: Scope string
- `content`: Detailed memory content in markdown
