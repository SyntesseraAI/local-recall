---
id: e35ac0fd-e7dd-4bc1-b1f1-97c5eab347e4
subject: Memory extraction prompts guide Claude to create memories from transcripts
keywords:
  - memory-extraction-prompt
  - prompt-template
  - extraction-guidance
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:25:02.151Z'
content_hash: '4311600767855054'
---
The memory extraction prompt in src/prompts/memory-extraction.ts provides explicit instructions for Claude to generate memories from session transcripts. The prompt:

- Guides Claude to identify important learnings, decisions, and solutions from transcripts
- Specifies the YAML frontmatter format for memory metadata
- Requests JSON-formatted memory arrays with required fields
- Emphasizes scope selection (global, file:path, or area:name)
- Uses specific keywords that are searchable and relevant
- Validates memory extraction results before creation
