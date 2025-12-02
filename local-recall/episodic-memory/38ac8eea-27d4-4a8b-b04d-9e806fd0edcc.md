---
id: 38ac8eea-27d4-4a8b-b04d-9e806fd0edcc
subject: Transcript collection path resolution for Windows compatibility
keywords:
  - windows
  - path-resolution
  - transcript-collector
  - cross-platform
  - posix-paths
applies_to: 'area:transcript-collector'
occurred_at: '2025-12-01T16:02:13.611Z'
content_hash: 6816da42efafe622
---
# Windows Path Compatibility in Transcript Collection

When resolving transcript paths from Claude Code, the system must handle platform-specific path formats:

## Windows Considerations

- Claude Code on Windows may use forward slashes or backslashes in paths
- Environment paths like `APPDATA` need proper resolution
- Project paths derived from working directories may differ between platforms

## Cross-Platform Path Handling

The transcript collector should:
- Normalize paths for the current platform using `path.resolve()` or similar
- Handle both forward and backward slashes consistently
- Use `path.join()` for constructing paths to ensure platform compatibility
- Consider that `~` expansion works differently on Windows (uses USERPROFILE instead of HOME)

## Local-Recall Memory Directory

The memory directory location should be flexible and configurable, not hardcoded to assume Unix-like paths.
