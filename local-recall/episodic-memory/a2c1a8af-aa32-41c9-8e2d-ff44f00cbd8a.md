---
id: a2c1a8af-aa32-41c9-8e2d-ff44f00cbd8a
subject: Local Recall transcript collection and processing workflow
keywords:
  - transcript-collector
  - transcript-condenser
  - processing
  - mcp-server
  - async-daemon
  - memory-extraction
applies_to: global
occurred_at: '2025-12-02T21:15:40.272Z'
content_hash: 747a80dd571af2a0
---
# Local Recall Transcript Processing Workflow

## Architecture

Local Recall processes Claude transcripts through a multi-stage pipeline:

1. **Transcript Collection** (`TranscriptCollector`)
   - Copies transcripts from Claude's cache (`~/.claude/projects/<project>/transcripts/`) to Local Recall's working directory
   - Enables processing without depending on Claude Code's directory structure

2. **Transcript Condensing** (`TranscriptCondenser`)
   - Reduces verbose transcripts to essential events
   - Creates compact format suitable for memory extraction
   - Reduces token overhead when processing with Claude API

3. **Memory Extraction**
   - Processes condensed transcripts with Claude to extract valuable memories
   - Creates structured markdown files in `local-recall/episodic-memory/`
   - Handles deduplication based on content hash and timestamp

4. **MCP Server Daemon** (Background process)
   - Runs every 5 minutes to check for new/modified transcripts
   - Processes transcripts asynchronously
   - Tracks processed transcripts to detect changes
   - Deletes and recreates memories when transcripts are updated

## Key Points

- The workflow is **asynchronous** - memories are extracted in background, not real-time
- Uses `processed-log.ts` to track which transcripts have been processed
- Enables memory extraction without blocking Claude Code sessions
- Scales to handle multiple projects and large transcript volumes
