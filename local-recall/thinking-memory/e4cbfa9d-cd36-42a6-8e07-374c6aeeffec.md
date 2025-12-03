---
id: e4cbfa9d-cd36-42a6-8e07-374c6aeeffec
subject: >-
  The user is saying the mutex error hasn't triggered so far. Looking back at
  the test output, I see...
applies_to: global
occurred_at: '2025-12-03T11:20:01.993Z'
content_hash: ae0ce248e65a7c51
---
## Thought

The user is saying the mutex error hasn't triggered so far. Looking back at the test output, I see only one mutex error from my concurrent test. This is progress - it means the file locking is mostly working, but there's still an edge case where the lock doesn't prevent concurrent ONNX loading.

Let me run another test to see if we can reproduce it again.

## Output

Let me run more aggressive concurrent tests to trigger the race condition:
