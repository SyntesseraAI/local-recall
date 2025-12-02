---
id: dfbe5ba2-5719-4fb0-b96e-ca9e2f9fde77
subject: Transcript collector architecture and event types
keywords:
  - transcript
  - collector
  - events
  - architecture
  - jsonl
  - parsing
  - session
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-01T16:15:14.557Z'
content_hash: 7e929a1fe95befb5
---
# Transcript Collector Architecture

The transcript collector (src/core/transcript-collector.ts) reads JSONL transcript files and extracts structured event information.

## Event Types

Transcripts contain multiple event types that the collector needs to handle:
- User messages and assistant responses
- Tool invocations (Bash, Read, Edit, Write, etc.)
- Tool results (success/failure outcomes)
- Session metadata

## Current Implementation Status

The collector currently:
- Reads transcript files line-by-line
- Parses each line as JSON
- Maps events to a normalized format
- Handles tool invocations and results

## Future Enhancement: Condensing

A condensing feature is being implemented to:
- Group related events into higher-level summaries
- Compress consecutive tool invocations into single entries
- Reduce token count for memory extraction
- Make transcripts more readable and extractable

Example: Instead of separate Tool: Read and Result: OK events, condense to a single summary showing the tool name and outcome.
