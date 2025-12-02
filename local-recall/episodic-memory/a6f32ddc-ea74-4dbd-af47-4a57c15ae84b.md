---
id: a6f32ddc-ea74-4dbd-af47-4a57c15ae84b
subject: >-
  Memory extraction prompts are externalized in separate configuration file for
  maintainability
keywords:
  - memory extraction
  - prompts
  - configuration
  - claude prompts
applies_to: 'file:src/prompts/memory-extraction.ts'
occurred_at: '2025-12-01T16:07:15.552Z'
content_hash: ed32cbd7086c0e72
---
The Claude prompts used for memory extraction are maintained in a separate file (`src/prompts/memory-extraction.ts`) rather than being hardcoded in the extractor. This allows for easy maintenance and iteration on the extraction logic without modifying the core extractor code. The prompts define how Claude should analyze transcripts and what format the extracted data should follow.
