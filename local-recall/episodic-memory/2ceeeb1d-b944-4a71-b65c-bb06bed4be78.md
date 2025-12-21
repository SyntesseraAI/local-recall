---
id: 2ceeeb1d-b944-4a71-b65c-bb06bed4be78
subject: Memory extraction tests must properly mock Claude API responses
keywords:
  - memory-extractor
  - testing
  - mocking
  - mock-claude
  - unit-tests
applies_to: 'file:tests/unit/core/memory-extractor.test.ts'
occurred_at: '2025-12-21T19:19:00.855Z'
content_hash: be0868a896f54e3d
---
Created comprehensive test suite for memory-extractor.ts covering: 1) Happy path with valid object response `{ memories: [...] }`, 2) Direct array response `[{...}]` to test the array-wrapping fix, 3) Invalid schema responses that fail validation, 4) Empty/null responses. Tests use `@anthropic-sdk/sdk` mocking. The test file at tests/unit/core/memory-extractor.test.ts includes 6 test cases verifying both valid parsing and edge case handling.
