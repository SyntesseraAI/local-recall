import { z } from 'zod';

/**
 * Schema for extracted memories from Claude CLI
 */
export const extractedMemorySchema = z.object({
  subject: z.string().min(1).max(200).describe('Brief one-line description of the memory'),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(10).describe('Searchable keywords'),
  applies_to: z.string().describe("Scope: 'global', 'file:<path>', or 'area:<name>'"),
  content: z.string().min(10).describe('The actual memory content in markdown'),
});

export const extractedMemoriesSchema = z.object({
  memories: z.array(extractedMemorySchema),
});

export type ExtractedMemory = z.infer<typeof extractedMemorySchema>;
export type ExtractedMemories = z.infer<typeof extractedMemoriesSchema>;

/**
 * JSON schema for Claude CLI output format
 */
export const MEMORY_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    memories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Brief one-line description of the memory (max 200 chars)',
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Searchable keywords (1-10 keywords)',
          },
          applies_to: {
            type: 'string',
            description: "Scope: 'global', 'file:<path>', or 'area:<name>'",
          },
          content: {
            type: 'string',
            description: 'The actual memory content in markdown format',
          },
        },
        required: ['subject', 'keywords', 'applies_to', 'content'],
      },
    },
  },
  required: ['memories'],
};

/**
 * Build the memory extraction prompt
 * @param condensedTranscript - The condensed transcript content (from transcript-condenser)
 * @param projectPath - The path to the project for context
 */
export function buildMemoryExtractionPrompt(condensedTranscript: string, projectPath: string): string {
  // Prefix with [LOCAL_RECALL_INTERNAL] to prevent UserPromptSubmit hook recursion
  return `[LOCAL_RECALL_INTERNAL] You are analyzing a Claude Code session transcript to extract valuable memories that will help future AI assistants working on this codebase.

## Project Context
Working directory: ${projectPath}

## Transcript Format
The transcript is condensed into events:
- \`[User]\` - What the user asked or requested
- \`[Assistant]\` - What Claude said or explained
- \`[Tool: Name]\` - Tool invocations (Read, Edit, Write, Bash, Grep, etc.)
- \`[Result: OK/ERROR]\` - Outcome of tool invocations

## Your Task
Analyze the following transcript and extract memories based on these questions:

1. **What was learned?** - New knowledge or insights gained during this session
2. **What is now known?** - Important facts about the codebase, architecture, or conventions
3. **What is specific to this codebase?** - Unique patterns, configurations, or quirks discovered
4. **What problems were solved?** - Bugs fixed, issues resolved, and how they were solved

## Guidelines for Memory Extraction

- **Be specific**: Include file paths, function names, and concrete details
- **Be concise**: Each memory should focus on one concept or discovery
- **Be actionable**: Memories should help future assistants avoid mistakes or work more efficiently
- **Use appropriate scope**:
  - \`global\` - Applies to the entire codebase (architecture, conventions, preferences)
  - \`file:<path>\` - Specific to a particular file (e.g., \`file:src/utils/config.ts\`)
  - \`area:<name>\` - Related to a component or area (e.g., \`area:authentication\`, \`area:database\`)

## What to Extract

DO extract:
- Architectural decisions and their reasoning
- Bug fixes and the root cause analysis
- Code patterns or conventions specific to this project
- Configuration quirks or gotchas
- User preferences discovered during the session
- Important relationships between components
- Performance considerations or optimizations applied

DO NOT extract:
- Generic programming knowledge (Claude already knows this)
- Temporary debugging steps that aren't useful long-term
- Obvious or trivial information
- Sensitive data (API keys, passwords, personal info)
- Information that would become outdated quickly

## Output Format

IMPORTANT: Return ONLY a valid JSON object with no explanation, no markdown formatting, no code blocks - just raw JSON.

The JSON object must have a "memories" array. Each memory should have:
- \`subject\`: Brief one-line description (max 200 chars)
- \`keywords\`: Array of 1-10 searchable keywords (lowercase, specific)
- \`applies_to\`: Scope string (\`global\`, \`file:<path>\`, or \`area:<name>\`)
- \`content\`: Detailed memory content in markdown format

If no valuable memories can be extracted, return: { "memories": [] }

## Condensed Transcript

${condensedTranscript}

Return ONLY the JSON object now:`;
}
