---
id: d4966f7a-2f48-4ecc-a1da-7fd1dca9ad4b
subject: Claude Haiku model availability for local execution
keywords:
  - claude
  - haiku
  - model
  - cli
  - execution
  - keyword extraction
applies_to: global
occurred_at: '2025-12-02T06:58:16.534Z'
content_hash: 01a0c5e3a5099e46
---
Claude Haiku is available as a CLI tool via `claude -p --model haiku` for local execution. This is used in the user-prompt-submit hook to extract keywords from user prompts before searching memories. The Haiku model is fast and lightweight, making it suitable for quick tasks like keyword extraction during hook execution.
