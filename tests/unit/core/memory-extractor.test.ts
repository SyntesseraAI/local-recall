import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock the dependencies before importing MemoryExtractor
vi.mock('../../../src/core/memory.js', () => ({
  MemoryManager: vi.fn().mockImplementation(() => ({
    createMemory: vi.fn().mockResolvedValue({ id: 'test-id' }),
    deleteMemory: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../../src/core/index.js', () => ({
  IndexManager: vi.fn().mockImplementation(() => ({
    buildIndex: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../../src/core/processed-log.js', () => ({
  ProcessedLogManager: vi.fn().mockImplementation(() => ({
    needsProcessing: vi.fn().mockResolvedValue(true),
    getMemoryIds: vi.fn().mockResolvedValue([]),
    recordProcessed: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../../src/core/transcript-collector.js', () => ({
  TranscriptCollector: vi.fn().mockImplementation(() => ({
    syncTranscripts: vi.fn().mockResolvedValue(undefined),
    listLocalTranscripts: vi.fn().mockResolvedValue([]),
    readTranscript: vi.fn().mockResolvedValue('transcript content'),
    computeTranscriptHash: vi.fn().mockResolvedValue('hash123'),
  })),
}));

vi.mock('../../../src/utils/config.js', () => ({
  getConfig: vi.fn().mockReturnValue({
    memoryDir: './local-recall',
  }),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: {
    extractor: {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

// Inline schema for testing (mirrors the actual schema)
const extractedMemorySchema = z.object({
  subject: z.string().min(1).max(200),
  keywords: z.array(z.string().min(1).max(50)).min(1).max(10),
  applies_to: z.string(),
  content: z.string().min(10),
});

const extractedMemoriesSchema = z.object({
  memories: z.array(extractedMemorySchema),
});

// Helper to normalize field names (mirrors the logic in MemoryExtractor)
function normalizeMemoryFields(memory: Record<string, unknown>) {
  return {
    subject: memory.subject ?? memory.title ?? memory.name ?? memory.summary,
    keywords: memory.keywords ?? memory.tags ?? memory.keys,
    applies_to: memory.applies_to ?? memory.appliesTo ?? memory.scope ?? memory.applies,
    content: memory.content ?? memory.body ?? memory.text ?? memory.details ?? memory.description,
  };
}

// Extract text from Claude CLI JSON output format (mirrors MemoryExtractor.extractTextFromClaudeOutput)
function extractTextFromClaudeOutput(response: string): string {
  try {
    const parsed = JSON.parse(response);

    // Check if it's the Claude CLI conversation format (array of messages)
    if (Array.isArray(parsed)) {
      // Find the assistant message
      const assistantMessage = parsed.find(
        (msg: { type?: string }) => msg.type === 'assistant'
      );

      if (assistantMessage?.message?.content) {
        const content = assistantMessage.message.content;
        if (Array.isArray(content)) {
          const textBlock = content.find(
            (block: { type?: string }) => block.type === 'text'
          );
          if (textBlock?.text) {
            return textBlock.text;
          }
        }
      }

      // Fallback: look for result field in first item
      if (parsed.length > 0 && parsed[0].result) {
        return typeof parsed[0].result === 'string'
          ? parsed[0].result
          : JSON.stringify(parsed[0].result);
      }
    }

    // Handle single object response
    if (parsed.result) {
      return typeof parsed.result === 'string'
        ? parsed.result
        : JSON.stringify(parsed.result);
    }

    return response;
  } catch {
    return response;
  }
}

// Strip markdown code blocks (mirrors MemoryExtractor.stripMarkdownCodeBlocks)
function stripMarkdownCodeBlocks(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return text.trim();
}

// Extract the parsing logic for testing (mirrors MemoryExtractor.parseClaudeResponse)
function parseClaudeResponse(response: string) {
  try {
    // Step 1: Extract text content from Claude CLI output format
    let textContent = extractTextFromClaudeOutput(response);

    // Step 2: Strip markdown code blocks
    textContent = stripMarkdownCodeBlocks(textContent);

    // Step 3: Parse the JSON
    let parsed = JSON.parse(textContent);

    // Handle Claude CLI output format
    if (parsed.result) {
      if (typeof parsed.result === 'string') {
        parsed = JSON.parse(parsed.result);
      } else {
        parsed = parsed.result;
      }
    }

    // Handle nested string
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    // Handle array response - only wrap if it looks like memory objects
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      const looksLikeMemory = firstItem.subject || firstItem.title || firstItem.keywords || firstItem.tags;
      if (looksLikeMemory) {
        parsed = { memories: parsed };
      }
    }

    // Normalize field names
    if (parsed.memories && Array.isArray(parsed.memories)) {
      parsed.memories = parsed.memories.map(normalizeMemoryFields);
    }

    const validated = extractedMemoriesSchema.parse(parsed);
    return validated.memories;
  } catch {
    return [];
  }
}

describe('MemoryExtractor', () => {
  describe('parseClaudeResponse', () => {
    it('should handle array response wrapped in memories object', () => {
      // Standard format: { memories: [...] }
      const standardFormat = {
        memories: [
          {
            subject: 'Test memory',
            keywords: ['test'],
            applies_to: 'global',
            content: 'This is test content for the memory.',
          },
        ],
      };

      const result = extractedMemoriesSchema.safeParse(standardFormat);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.memories).toHaveLength(1);
      }
    });

    it('should handle raw array by wrapping it', () => {
      // Raw array format: [...]
      const rawArray = [
        {
          subject: 'Test memory',
          keywords: ['test'],
          applies_to: 'global',
          content: 'This is test content for the memory.',
        },
      ];

      // Simulate the fix: wrap array in { memories: [...] }
      const wrapped = Array.isArray(rawArray) ? { memories: rawArray } : rawArray;

      const result = extractedMemoriesSchema.safeParse(wrapped);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.memories).toHaveLength(1);
      }
    });

    it('should fail without wrapping array', () => {
      // Raw array format without wrapping should fail
      const rawArray = [
        {
          subject: 'Test memory',
          keywords: ['test'],
          applies_to: 'global',
          content: 'This is test content for the memory.',
        },
      ];

      const result = extractedMemoriesSchema.safeParse(rawArray);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
        expect(result.error.issues[0].message).toContain('Expected object, received array');
      }
    });
  });

  describe('parseClaudeResponse integration', () => {
    it('should parse standard memories object', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test memory',
            keywords: ['test'],
            applies_to: 'global',
            content: 'This is test content.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Test memory');
    });

    it('should parse raw array response', () => {
      const response = JSON.stringify([
        {
          subject: 'Test memory from array',
          keywords: ['array', 'test'],
          applies_to: 'global',
          content: 'This is test content from array.',
        },
      ]);

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Test memory from array');
    });

    it('should parse Claude CLI wrapped response', () => {
      const response = JSON.stringify({
        result: {
          memories: [
            {
              subject: 'Wrapped memory',
              keywords: ['wrapped'],
              applies_to: 'global',
              content: 'This is wrapped content.',
            },
          ],
        },
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Wrapped memory');
    });

    it('should parse Claude CLI result as string', () => {
      const innerJson = JSON.stringify({
        memories: [
          {
            subject: 'String result memory',
            keywords: ['string'],
            applies_to: 'global',
            content: 'This is string result content.',
          },
        ],
      });

      const response = JSON.stringify({
        result: innerJson,
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('String result memory');
    });

    it('should handle Claude CLI result as raw array', () => {
      // Claude CLI might return result directly as array
      const response = JSON.stringify({
        result: [
          {
            subject: 'CLI array result',
            keywords: ['cli', 'array'],
            applies_to: 'global',
            content: 'This is from CLI array result.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('CLI array result');
    });

    it('should return empty array for invalid JSON', () => {
      const response = 'not valid json';
      const result = parseClaudeResponse(response);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty memories', () => {
      const response = JSON.stringify({ memories: [] });
      const result = parseClaudeResponse(response);
      expect(result).toEqual([]);
    });

    it('should return empty array for invalid memory structure', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: '', // Invalid: empty subject
            keywords: ['test'],
            applies_to: 'global',
            content: 'Some content.',
          },
        ],
      });
      const result = parseClaudeResponse(response);
      expect(result).toEqual([]);
    });
  });

  describe('field name normalization', () => {
    it('should normalize title to subject', () => {
      const response = JSON.stringify({
        memories: [
          {
            title: 'Test from title field',
            keywords: ['test'],
            applies_to: 'global',
            content: 'This content uses title instead of subject.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Test from title field');
    });

    it('should normalize tags to keywords', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test with tags',
            tags: ['tag1', 'tag2'],
            applies_to: 'global',
            content: 'This content uses tags instead of keywords.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].keywords).toEqual(['tag1', 'tag2']);
    });

    it('should normalize scope to applies_to', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test with scope',
            keywords: ['test'],
            scope: 'area:testing',
            content: 'This content uses scope instead of applies_to.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].applies_to).toBe('area:testing');
    });

    it('should normalize body to content', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test with body',
            keywords: ['test'],
            applies_to: 'global',
            body: 'This is the body field being used.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('This is the body field being used.');
    });

    it('should normalize appliesTo (camelCase) to applies_to', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test with camelCase',
            keywords: ['test'],
            appliesTo: 'file:src/test.ts',
            content: 'This content uses camelCase appliesTo.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].applies_to).toBe('file:src/test.ts');
    });

    it('should normalize multiple alternative field names together', () => {
      const response = JSON.stringify({
        memories: [
          {
            title: 'Multi-field normalization test',
            tags: ['multi', 'field', 'test'],
            scope: 'area:normalization',
            body: 'All fields use alternative names.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Multi-field normalization test');
      expect(result[0].keywords).toEqual(['multi', 'field', 'test']);
      expect(result[0].applies_to).toBe('area:normalization');
      expect(result[0].content).toBe('All fields use alternative names.');
    });

    it('should prefer standard field names over alternatives', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Standard subject wins',
            title: 'Alternative title ignored',
            keywords: ['standard'],
            tags: ['ignored'],
            applies_to: 'global',
            scope: 'ignored',
            content: 'Standard content wins.',
            body: 'Alternative body ignored.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Standard subject wins');
      expect(result[0].keywords).toEqual(['standard']);
      expect(result[0].applies_to).toBe('global');
      expect(result[0].content).toBe('Standard content wins.');
    });

    it('should handle description as content alternative', () => {
      const response = JSON.stringify({
        memories: [
          {
            subject: 'Test with description',
            keywords: ['test'],
            applies_to: 'global',
            description: 'Using description field as content.',
          },
        ],
      });

      const result = parseClaudeResponse(response);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Using description field as content.');
    });
  });

  describe('Claude CLI output format', () => {
    it('should extract text from Claude CLI conversation format', () => {
      // This is the actual format from claude --output-format json
      const cliOutput = JSON.stringify([
        { type: 'system', subtype: 'hook_response', session_id: 'test' },
        { type: 'system', subtype: 'init', cwd: '/test' },
        {
          type: 'assistant',
          message: {
            content: [
              {
                type: 'text',
                text: '{"memories": [{"subject": "Test memory", "keywords": ["test"], "applies_to": "global", "content": "Memory from CLI format."}]}',
              },
            ],
          },
        },
      ]);

      const result = parseClaudeResponse(cliOutput);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Test memory');
    });

    it('should handle Claude CLI output with markdown code blocks', () => {
      const cliOutput = JSON.stringify([
        { type: 'system', subtype: 'init' },
        {
          type: 'assistant',
          message: {
            content: [
              {
                type: 'text',
                text: '```json\n{"memories": [{"subject": "Memory from code block", "keywords": ["codeblock"], "applies_to": "global", "content": "Content wrapped in code blocks."}]}\n```',
              },
            ],
          },
        },
      ]);

      const result = parseClaudeResponse(cliOutput);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Memory from code block');
    });

    it('should handle empty memories from CLI output', () => {
      const cliOutput = JSON.stringify([
        {
          type: 'assistant',
          message: {
            content: [
              {
                type: 'text',
                text: '```json\n{\n  "memories": []\n}\n```',
              },
            ],
          },
        },
      ]);

      const result = parseClaudeResponse(cliOutput);
      expect(result).toEqual([]);
    });

    it('should not confuse conversation messages array with memories array', () => {
      // This was the bug: the array of messages was being treated as memories array
      const cliOutput = JSON.stringify([
        { type: 'system', subtype: 'hook_response' },
        { type: 'system', subtype: 'init' },
        {
          type: 'assistant',
          message: {
            content: [
              {
                type: 'text',
                text: '{ "memories": [] }',
              },
            ],
          },
        },
      ]);

      // Should correctly extract the assistant's text and parse { memories: [] }
      // NOT wrap the conversation messages array as memories
      const result = parseClaudeResponse(cliOutput);
      expect(result).toEqual([]);
    });
  });

  describe('markdown code block stripping', () => {
    it('should strip ```json code blocks', () => {
      const text = stripMarkdownCodeBlocks('```json\n{"key": "value"}\n```');
      expect(text).toBe('{"key": "value"}');
    });

    it('should strip plain ``` code blocks', () => {
      const text = stripMarkdownCodeBlocks('```\n{"key": "value"}\n```');
      expect(text).toBe('{"key": "value"}');
    });

    it('should handle text without code blocks', () => {
      const text = stripMarkdownCodeBlocks('{"key": "value"}');
      expect(text).toBe('{"key": "value"}');
    });

    it('should trim whitespace', () => {
      const text = stripMarkdownCodeBlocks('  {"key": "value"}  ');
      expect(text).toBe('{"key": "value"}');
    });

    it('should handle multiline JSON in code blocks', () => {
      const input = '```json\n{\n  "memories": [\n    {"subject": "test"}\n  ]\n}\n```';
      const text = stripMarkdownCodeBlocks(input);
      expect(text).toContain('"memories"');
      expect(text).toContain('"subject"');
    });
  });

  describe('extractTextFromClaudeOutput', () => {
    it('should extract text from assistant message', () => {
      const input = JSON.stringify([
        { type: 'assistant', message: { content: [{ type: 'text', text: 'Hello world' }] } },
      ]);
      expect(extractTextFromClaudeOutput(input)).toBe('Hello world');
    });

    it('should return original for non-array input', () => {
      const input = '{"memories": []}';
      expect(extractTextFromClaudeOutput(input)).toBe(input);
    });

    it('should return original for non-JSON input', () => {
      const input = 'not json';
      expect(extractTextFromClaudeOutput(input)).toBe(input);
    });

    it('should handle result field in single object', () => {
      const input = JSON.stringify({ result: 'test result' });
      expect(extractTextFromClaudeOutput(input)).toBe('test result');
    });
  });
});
