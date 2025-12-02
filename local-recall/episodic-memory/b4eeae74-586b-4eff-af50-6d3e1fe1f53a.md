---
id: b4eeae74-586b-4eff-af50-6d3e1fe1f53a
subject: Transcripts are condensed into discrete events before memory extraction
keywords:
  - transcript
  - condensing
  - events
  - user-assistant
  - tool-invocations
  - memory-extraction
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T07:40:58.025Z'
content_hash: ca05a0c8c68b9743
---
# Transcript Condensing for Memory Extraction

Before sending transcripts to Claude for memory extraction, they are condensed into discrete events:

- `[User]` - User questions or requests
- `[Assistant]` - Claude's responses and explanations  
- `[Tool: Name]` - Tool invocations (e.g., `[Tool: Read]`, `[Tool: Bash]`)
- `[Result: OK/ERROR]` - Outcome of tool invocations

**Advantages of this format:**
- Reduces token usage by eliminating verbose formatting
- Maintains semantic content while reducing noise
- Makes it easier for Claude to identify key events and learnings
- Improves memory quality by focusing on actual work done

**Implementation:**
- Transcript condensing logic is in `src/core/transcript-collector.ts`
- This happens before the `claude -p` extraction command is executed
