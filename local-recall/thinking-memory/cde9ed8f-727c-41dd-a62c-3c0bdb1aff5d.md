---
id: cde9ed8f-727c-41dd-a62c-3c0bdb1aff5d
subject: >-
  The user is asking about the Ollama embedding endpoint. The error shows it's
  trying to connect to...
applies_to: global
occurred_at: '2025-12-20T22:32:45.481Z'
content_hash: f6eb8a2a516424f0
---
## Thought

The user is asking about the Ollama embedding endpoint. The error shows it's trying to connect to `http://127.0.0.1:49889/embedding` which is an unusual port (not the default 11434). 

Let me check the embedding code to understand what's happening. It seems like Ollama might be using a different port, or there's some proxy/forwarding going on.

## Output

No, that's Ollama's internal embedding endpoint. But the port `49889` is strange - Ollama normally runs on `11434`. Let me check what's happening:
