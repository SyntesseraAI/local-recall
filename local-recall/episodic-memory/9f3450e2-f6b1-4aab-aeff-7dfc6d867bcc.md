---
id: 9f3450e2-f6b1-4aab-aeff-7dfc6d867bcc
subject: >-
  TypeScript configuration targets ES2020 with commonjs module output for
  Node.js compatibility
keywords:
  - typescript
  - es2020
  - commonjs
  - node.js
  - build-target
  - tsconfig
applies_to: global
occurred_at: '2025-12-02T17:40:01.978Z'
content_hash: 3221b872ae602d28
---
# TypeScript Configuration for Local Recall

## Compiler Target and Module Settings

- **target**: `ES2020` - Supports modern JavaScript features while maintaining broad Node.js compatibility
- **module**: `commonjs` - Uses CommonJS module format for Node.js compatibility
- **lib**: Includes `ES2020` and `DOM` (for potential future browser use)

## Rationale

ES2020 is used because:
- Supports async/await, arrow functions, destructuring, spread operator
- Widely supported by Node.js 14+
- Provides good balance between modern syntax and compatibility
- Local Recall targets Node.js environment (hooks and MCP server)

## Build Output

All TypeScript files compile to JavaScript in the `dist/` directory:
- `src/hooks/*.ts` → `dist/hooks/*.js`
- `src/mcp-server/*.ts` → `dist/mcp-server/*.js`
- `src/core/*.ts` → `dist/core/*.js`

## Implications for Development

1. Use TypeScript features available in ES2020 (rest parameters, optional chaining, etc.)
2. Avoid ES2021+ features (logical assignment operators, numeric separators)
3. Import statements compile to `require()` calls
4. All built files should be executable with `node` directly
