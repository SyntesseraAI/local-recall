---
id: a6bb4c1a-7d2c-4a6c-8eb1-65bd5efdd2ea
subject: >-
  Session start transcript may not be immediately available in transcripts
  folder
keywords:
  - transcripts
  - session-start
  - file-system
  - timing
  - async
  - race-condition
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-02T21:39:47.856Z'
content_hash: c74641c3a26ec8b9
---
# Session Start Transcript Timing Issue

When a Claude Code session starts, the transcript file may not be immediately written to the transcripts folder. This can cause issues when trying to read the transcript path provided by the SessionStart hook.

## Problem

The SessionStart hook receives a `transcript_path` parameter pointing to a transcript file that may not yet exist on disk. Attempting to read this file immediately can fail.

## Solution

Implement retry logic with exponential backoff when reading transcript files in the SessionStart hook. Wait a brief period (e.g., 500ms initial delay) before attempting to read the file, and retry up to 5-10 times.

This is particularly important for the transcript-collector when processing the initial transcript on session start.
