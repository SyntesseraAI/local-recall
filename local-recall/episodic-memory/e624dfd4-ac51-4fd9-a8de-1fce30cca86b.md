---
id: e624dfd4-ac51-4fd9-a8de-1fce30cca86b
subject: Memory extraction system has infinite recursion bug with nested transcripts
keywords:
  - memory extraction
  - recursion
  - bug
  - transcript processing
  - infinite loop
  - local-recall-internal
applies_to: global
occurred_at: '2025-12-02T22:02:03.041Z'
content_hash: d9cc1e2f4152f38c
---
The memory extraction system (Stop hook / MCP daemon) has a critical bug where it processes transcripts containing its own `[LOCAL_RECALL_INTERNAL]` memory extraction prompts, creating infinite recursion.

**Problem**: When the Stop hook or MCP daemon processes a transcript that includes the memory extraction prompt itself, it tries to extract memories from that prompt. If those extracted memories are added back to the transcript for the next processing cycle, it creates a loop where the same prompt keeps getting processed.

**Root Cause**: The transcript processing doesn't filter out or skip `[LOCAL_RECALL_INTERNAL]` sections that contain the memory extraction system's own prompts.

**Impact**: This can cause the memory extraction process to get stuck in an infinite loop or create duplicate/corrupted memories.

**Solution Needed**: The transcript collector and condenser should filter out `[LOCAL_RECALL_INTERNAL]` sections before passing transcripts to the memory extraction prompt, or the extraction prompt should explicitly ignore these sections.
