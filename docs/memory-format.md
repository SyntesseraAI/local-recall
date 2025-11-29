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
created_at: <iso-8601-timestamp>
updated_at: <iso-8601-timestamp>
---

# <Title>

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

### created_at (auto)
- Type: `string` (ISO 8601)
- Automatically set on creation
- Never modified after creation

### updated_at (auto)
- Type: `string` (ISO 8601)
- Updated on every modification
- Used for sorting by recency

## Content Section

The content section follows standard markdown:

### Supported Elements

- **Headings**: H1-H6
- **Paragraphs**: Regular text
- **Code blocks**: Fenced with language hint
- **Lists**: Ordered and unordered
- **Links**: Standard markdown links
- **Emphasis**: Bold, italic

### Best Practices

1. **Start with context**: Explain why this memory exists
2. **Be specific**: Include concrete details
3. **Include code**: Show examples when relevant
4. **Keep it atomic**: One concept per memory

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
created_at: 2025-01-15T10:30:00Z
updated_at: 2025-01-15T10:30:00Z
---

# Error Handling Convention

All errors in this project should:

1. Extend the base `AppError` class
2. Include an error code for client handling
3. Be logged with full stack trace in development

## Example

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
created_at: 2025-01-16T14:20:00Z
updated_at: 2025-01-16T14:20:00Z
---

# Auth Middleware Context

The auth middleware in `src/middleware/auth.ts` attaches user context to requests.

## Important Notes

- Token is extracted from `Authorization` header
- User object is attached to `req.user`
- Unauthenticated requests get `req.user = null`

## Usage

\`\`\`typescript
app.get('/profile', authMiddleware, (req, res) => {
  // req.user is guaranteed to be populated here
  res.json(req.user);
});
\`\`\`
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
created_at: 2025-01-17T09:15:00Z
updated_at: 2025-01-18T11:30:00Z
---

# Database Connection Pooling

The database layer uses connection pooling with these settings:

| Setting | Value | Reason |
|---------|-------|--------|
| min | 2 | Keep warm connections |
| max | 10 | Prevent overload |
| idleTimeout | 30000 | Release unused connections |

## Configuration Location

Settings are in `src/config/database.ts`

## Performance Notes

- Pool size was increased from 5 to 10 after load testing
- Idle timeout reduced from 60s to 30s to free resources faster
```

## Validation Rules

1. **ID**: Must be valid UUID v4
2. **Subject**: 1-200 characters
3. **Keywords**: 1-20 keywords, each 1-50 characters
4. **applies_to**: Must match pattern `global|file:.+|area:.+`
5. **Content**: Minimum 10 characters
