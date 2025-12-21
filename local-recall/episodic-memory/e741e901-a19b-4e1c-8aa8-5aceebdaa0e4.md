---
id: e741e901-a19b-4e1c-8aa8-5aceebdaa0e4
subject: Ollama is the recommended local embedding solution for multi-instance support
keywords:
  - ollama
  - embedding
  - local
  - multi-process
  - alternative
  - solution
applies_to: global
occurred_at: '2025-12-21T19:45:32.573Z'
content_hash: 44514cb22854ffb8
---
Ollama was identified as the best solution for local embeddings because: (1) It's a self-contained HTTP daemon that can be installed as a standalone package, (2) Multiple processes/instances can connect to a single Ollama server without mutex issues since the model is loaded once, (3) Installation is simple across platforms (brew install ollama on macOS, curl script on Linux, installer on Windows), (4) Uses nomic-embed-text model (768 dimensions) which is already configured in the codebase, (5) Runs on port 11434 by default and requires `ollama pull nomic-embed-text` to download the model.
