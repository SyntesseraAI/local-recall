# Memory Format

## Overview

Memories are stored as markdown files with YAML frontmatter. This format is:
- Human readable and editable
- Version control friendly
- Easy to parse programmatically
- Compatible with standard markdown tools

## File Structure

```markdown
---
id: <uuid>
subject: <brief description>
keywords:
  - <keyword1>
  - <keyword2>
applies_to: <scope>
occurred_at: <iso-8601-timestamp>
content_hash: <sha256-prefix>
---

<Content body>
```

## Frontmatter Fields

### id (required)
- Type: `string` (UUID v4)
- Auto-generated unique identifier
- Used for file naming: `<id>.md`

### subject (required)
- Type: `string`
- Brief one-line description
- Used in search results and listings
- Should be concise but descriptive

### keywords (required)
- Type: `string[]`
- Array of searchable keywords
- Used for index building and search
- Should include:
  - Technical terms
  - Concepts
  - Related technologies
  - Action words (fix, implement, configure)

### applies_to (required)
- Type: `string`
- Scope of the memory

| Value | Description |
|-------|-------------|
| `global` | Applies to entire project |
| `file:<path>` | Specific to a file (e.g., `file:src/api/auth.ts`) |
| `area:<name>` | Specific to a component/area (e.g., `area:authentication`) |

### occurred_at (required)
- Type: `string` (ISO 8601)
- Timestamp of when the original event/message occurred
- Used for deduplication together with `content_hash`
- Used for sorting memories chronologically

### content_hash (auto)
- Type: `string` (16-char SHA-256 prefix)
- Hash of the memory content for deduplication
- Used together with `occurred_at` to detect duplicates
- Ensures idempotent memory creation

## Content Section

The content section contains the full assistant message content without modification.

### Filtering Rules

Only certain messages are saved as memories:
- **User messages are not saved** - only assistant responses are stored
- **Single-line messages are skipped** - messages must have multiple lines to be considered substantive
- **No summarization** - qualifying messages are stored in full

This design ensures that only substantive assistant responses are retained, reducing noise while preserving important context.

### Supported Elements

- **Paragraphs**: Regular text
- **Code blocks**: Fenced with language hint
- **Lists**: Ordered and unordered
- **Links**: Standard markdown links
- **Emphasis**: Bold, italic
- **Tables**: Standard markdown tables

## Examples

### Global Memory: Project Convention

```markdown
---
id: 550e8400-e29b-41d4-a716-446655440000
subject: Error handling convention
keywords:
  - errors
  - exceptions
  - error-handling
  - conventions
applies_to: global
occurred_at: 2025-01-15T10:30:00Z
content_hash: a1b2c3d4e5f67890
---

All errors in this project should:

1. Extend the base `AppError` class
2. Include an error code for client handling
3. Be logged with full stack trace in development

Example:

\`\`\`typescript
class ValidationError extends AppError {
  constructor(message: string, field: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}
\`\`\`
```

### File-Specific Memory

```markdown
---
id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
subject: Auth middleware requires user context
keywords:
  - auth
  - middleware
  - user-context
  - authentication
applies_to: file:src/middleware/auth.ts
occurred_at: 2025-01-16T14:20:00Z
content_hash: b2c3d4e5f6789012
---

The auth middleware in `src/middleware/auth.ts` attaches user context to requests.

Important Notes:
- Token is extracted from `Authorization` header
- User object is attached to `req.user`
- Unauthenticated requests get `req.user = null`
```

### Area-Specific Memory

```markdown
---
id: 6ba7b811-9dad-11d1-80b4-00c04fd430c8
subject: Database connection pooling settings
keywords:
  - database
  - postgres
  - connection-pool
  - performance
applies_to: area:database
occurred_at: 2025-01-17T09:15:00Z
content_hash: c3d4e5f678901234
---

The database layer uses connection pooling with these settings:

| Setting | Value | Reason |
|---------|-------|--------|
| min | 2 | Keep warm connections |
| max | 10 | Prevent overload |
| idleTimeout | 30000 | Release unused connections |

Configuration is in `src/config/database.ts`

Pool size was increased from 5 to 10 after load testing.
Idle timeout reduced from 60s to 30s to free resources faster.
```

## Validation Rules

1. **ID**: Must be valid UUID v4
2. **Subject**: 1-200 characters
3. **Keywords**: 1-20 keywords, each 1-50 characters
4. **applies_to**: Must match pattern `global|file:.+|area:.+`
5. **occurred_at**: Must be valid ISO 8601 datetime
6. **content_hash**: Auto-generated 16-character SHA-256 prefix
7. **Content**: Minimum 10 characters

## Deduplication

Memories are deduplicated using the combination of `occurred_at` and `content_hash`. If a memory with the same values for both fields already exists, the creation is skipped and the existing memory is returned. This ensures idempotent memory creation across multiple hook invocations.
