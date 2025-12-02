---
id: 813efeb5-d967-43c4-92d5-3efbfeebdc9f
subject: Memory extractor handles transcript condensing with configurable token limits
keywords:
  - transcript condensing
  - token limits
  - summarization
  - memory extraction
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:15:09.745Z'
content_hash: fc82dc207d9b0d40
---
The memory extractor includes logic to condense transcripts before sending them to Claude for memory extraction. This prevents token overflow when processing very long transcripts. The condensing is configurable and aims to preserve the essential information while reducing size. This is important for the MCP daemon that processes transcripts asynchronously every 5 minutes and needs to handle potentially large session transcripts efficiently.
