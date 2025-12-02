---
id: fd2fe1ee-ea03-4eaf-abfb-72ada6e5728b
subject: Transcript collector formats events in standardized way
keywords:
  - transcript
  - collector
  - event-format
  - standardization
  - user-assistant-tools
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T22:29:40.838Z'
content_hash: 2c330b9ca6975b33
---
# Transcript Event Format

The transcript collector converts Claude Code session data into a standardized event format for consistent processing.

## Event Format Structure

Events are formatted as:
- `[User]` - User queries or requests
- `[Assistant]` - Claude's responses and explanations
- `[Tool: Name]` - Tool invocations (e.g., `[Tool: Read]`, `[Tool: Bash]`)
- `[Result: OK/ERROR]` - Outcome of tool invocations

## Event Content

- Each event contains the relevant details from that interaction
- Tool results show both success/failure status and relevant output
- User prompts and assistant responses are preserved as-is

## Use Cases

This standardized format enables:
- Easy parsing for memory extraction
- Consistent processing across different transcript sources
- Clear identification of what happened during a session
- Filtering and analysis by event type
