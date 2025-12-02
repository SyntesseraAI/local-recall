---
id: c38bffe7-d0b2-4bbd-9758-aaadffc835d6
subject: Transcript extraction workflow for memory creation
keywords:
  - transcript
  - memory
  - extraction
  - workflow
  - haiku
  - keywords
  - deduplication
applies_to: global
occurred_at: '2025-12-02T01:13:23.620Z'
content_hash: 4dda8276ad19d2dd
---
# Transcript Extraction Workflow

The process of extracting memories from transcripts follows these steps:

1. **Locate transcripts**: Find JSONL files in the Claude project transcripts directory
2. **Track processed transcripts**: Use content hashes to avoid reprocessing unchanged transcripts
3. **Extract session content**: Parse the transcript JSONL to get user prompts and assistant responses
4. **Generate keywords**: Use Claude Haiku to extract relevant keywords from the content
5. **Create memories**: Generate memory records with those keywords
6. **Deduplicate**: Check if memory with same `occurred_at` and `content_hash` already exists
7. **Store**: Save as markdown files in `local-recall/episodic-memory/`

## Key Details

- Transcripts are processed asynchronously (background daemon every 5 minutes)
- Keyword extraction uses `claude -p --model haiku` command
- Memory deduplication prevents duplicate entries for the same content
- Each memory includes metadata (id, subject, keywords, occurred_at, content_hash)
