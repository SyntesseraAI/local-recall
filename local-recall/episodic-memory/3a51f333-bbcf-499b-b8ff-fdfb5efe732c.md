---
id: 3a51f333-bbcf-499b-b8ff-fdfb5efe732c
subject: >-
  Local Recall transcript-collector processes Claude JSONL transcripts for
  memory extraction
keywords:
  - transcript-collector
  - transcripts
  - memory-extraction
  - jsonl
  - parsing
  - streaming
applies_to: 'file:src/core/transcript-collector.ts'
occurred_at: '2025-12-02T16:48:32.597Z'
content_hash: 5b41a98f20f1c86f
---
# Transcript Collector Implementation

The `transcript-collector.ts` module is responsible for reading and processing Claude Code transcripts stored in JSONL format.

## Key Responsibilities

1. **Locate transcripts** - Finds transcripts in `~/.claude/projects/<encoded-path>/transcripts/`
2. **Parse JSONL** - Reads line-delimited JSON format where each line is one transcript entry
3. **Filter relevant entries** - Only processes entries relevant for memory extraction
4. **Stream processing** - Handles large transcripts efficiently

## Transcript Entry Structure

Each line in the JSONL file represents a single entry with metadata about interactions between user and Claude.

## Integration with Memory System

Transcripts are processed by:
1. `transcript-collector.ts` - Reads raw transcripts
2. `transcript-condenser.ts` - Condenses/summarizes for processing
3. `memory-extractor.ts` - Extracts memories from condensed transcripts
4. `memory.ts` - Stores extracted memories as markdown files

The processed transcript tracking (`processed-log.ts`) prevents re-processing unchanged transcripts.
