---
id: 7f474caa-ab25-4be1-82ea-ca88ad52eae7
subject: Memory extractor parses and validates Claude API streaming responses
keywords:
  - response-parsing
  - json-validation
  - streaming-response
  - error-handling
applies_to: 'file:src/core/memory-extractor.ts'
occurred_at: '2025-12-01T16:25:08.461Z'
content_hash: 121c8ba0019e0428
---
The memory extraction implementation includes:

- Accumulation of streamed text content from Claude API
- JSON parsing of the final accumulated response
- Extraction of memory objects from the parsed JSON
- Error handling for parsing failures
- Returns an array of extracted memories to the caller

The streaming approach means response data arrives incrementally, and the extractor accumulates it until the stream completes, then parses the complete JSON result.
