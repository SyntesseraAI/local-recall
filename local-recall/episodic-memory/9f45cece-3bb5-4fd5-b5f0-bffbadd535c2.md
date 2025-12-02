---
id: 9f45cece-3bb5-4fd5-b5f0-bffbadd535c2
subject: Transcript condensing happens before memory extraction for efficiency
keywords:
  - transcript-condenser
  - transcript-processing
  - efficiency
  - token-reduction
applies_to: global
occurred_at: '2025-12-01T16:24:07.004Z'
content_hash: 18ca6d5ba14532d3
---
Transcripts are condensed before being sent to Claude for memory extraction. The `transcript-collector.ts` handles condensing transcripts into a more compact format that preserves essential information while reducing token usage. This is important for managing costs and performance when processing transcripts asynchronously in the background daemon.
