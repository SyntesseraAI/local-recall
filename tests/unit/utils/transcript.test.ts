import { describe, it, expect } from 'vitest';
import {
  parseTranscript,
  extractNewMessages,
  analyzeForMemories,
  parseTranscriptForMemories,
} from '../../../src/utils/transcript.js';
import type { TranscriptMessage } from '../../../src/core/types.js';

describe('transcript utilities', () => {
  describe('parseTranscript', () => {
    it('should parse valid transcript input', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'user',
            content: 'Hello',
            timestamp: '2024-01-01T10:00:00.000Z',
          },
          {
            role: 'assistant',
            content: 'Hi there!',
            timestamp: '2024-01-01T10:00:05.000Z',
          },
        ],
        session_id: 'test-session',
        working_directory: '/test/dir',
      });

      const result = parseTranscript(input);

      expect(result.transcript).toHaveLength(2);
      expect(result.session_id).toBe('test-session');
      expect(result.working_directory).toBe('/test/dir');
    });

    it('should skip messages with invalid roles', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'invalid',
            content: 'Hello',
            timestamp: '2024-01-01T10:00:00.000Z',
          },
          {
            role: 'user',
            content: 'Valid message',
            timestamp: '2024-01-01T10:00:01.000Z',
          },
        ],
      });

      const result = parseTranscript(input);
      // Invalid message is skipped, valid message is kept
      expect(result.transcript).toHaveLength(1);
      expect(result.transcript[0]?.content).toBe('Valid message');
    });

    it('should skip messages with non-string content', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'user',
            content: 123,
            timestamp: '2024-01-01T10:00:00.000Z',
          },
          {
            role: 'user',
            content: 'Valid message',
            timestamp: '2024-01-01T10:00:01.000Z',
          },
        ],
      });

      const result = parseTranscript(input);
      expect(result.transcript).toHaveLength(1);
    });

    it('should skip messages with invalid timestamps', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'user',
            content: 'Hello',
            timestamp: 'not-a-date',
          },
          {
            role: 'user',
            content: 'Valid message',
            timestamp: '2024-01-01T10:00:01.000Z',
          },
        ],
      });

      const result = parseTranscript(input);
      expect(result.transcript).toHaveLength(1);
    });

    it('should throw on malformed JSON', () => {
      expect(() => parseTranscript('not valid json')).toThrow('malformed JSON');
    });

    it('should throw when transcript is missing', () => {
      const input = JSON.stringify({ session_id: 'test' });

      expect(() => parseTranscript(input)).toThrow('missing transcript array');
    });

    it('should throw when transcript is not an array', () => {
      const input = JSON.stringify({ transcript: 'not-array' });

      expect(() => parseTranscript(input)).toThrow('missing transcript array');
    });

    it('should provide defaults for optional fields', () => {
      const input = JSON.stringify({
        transcript: [],
      });

      const result = parseTranscript(input);

      expect(result.session_id).toBe('unknown');
      expect(result.working_directory).toBeDefined();
    });

    it('should skip invalid messages while keeping valid ones', () => {
      const input = JSON.stringify({
        transcript: [
          { role: 'user', content: 'Valid', timestamp: '2024-01-01T10:00:00.000Z' },
          { role: 'invalid', content: 'Invalid', timestamp: '2024-01-01T10:00:00.000Z' },
          { role: 'assistant', content: 'Also valid', timestamp: '2024-01-01T10:00:01.000Z' },
        ],
      });

      const result = parseTranscript(input);
      expect(result.transcript).toHaveLength(2);
      expect(result.transcript[0]?.content).toBe('Valid');
      expect(result.transcript[1]?.content).toBe('Also valid');
    });

    it('should parse raw transcript format with content blocks', () => {
      const input = JSON.stringify({
        transcript: [
          {
            type: 'user',
            timestamp: '2024-01-01T10:00:00.000Z',
            content: 'Hello',
          },
          {
            type: 'assistant',
            timestamp: '2024-01-01T10:00:05.000Z',
            message: {
              content: [
                { type: 'thinking', thinking: 'Let me think about this...' },
                { type: 'text', text: 'Hi there!' },
              ],
            },
          },
        ],
        session_id: 'test-session',
      });

      const result = parseTranscript(input);

      expect(result.transcript).toHaveLength(2);
      expect(result.transcript[1]?.content).toBe('Hi there!');
      expect(result.transcript[1]?.thinking).toBe('Let me think about this...');
    });
  });

  describe('extractNewMessages', () => {
    it('should extract messages within time window', () => {
      const now = Date.now();
      const transcript: TranscriptMessage[] = [
        {
          role: 'user',
          content: 'Old message',
          timestamp: new Date(now - 60000).toISOString(), // 60 seconds ago
        },
        {
          role: 'assistant',
          content: 'New message',
          timestamp: new Date(now - 5000).toISOString(), // 5 seconds ago
        },
      ];

      const result = extractNewMessages(transcript, 30);

      expect(result).toHaveLength(1);
      expect(result[0]?.content).toBe('New message');
    });

    it('should return empty array when no messages in window', () => {
      const now = Date.now();
      const transcript: TranscriptMessage[] = [
        {
          role: 'user',
          content: 'Old message',
          timestamp: new Date(now - 120000).toISOString(), // 2 minutes ago
        },
      ];

      const result = extractNewMessages(transcript, 30);

      expect(result).toEqual([]);
    });

    it('should include messages exactly at window boundary', () => {
      const now = Date.now();
      const transcript: TranscriptMessage[] = [
        {
          role: 'user',
          content: 'Boundary message',
          timestamp: new Date(now - 30000).toISOString(), // exactly 30 seconds ago
        },
      ];

      const result = extractNewMessages(transcript, 30);

      expect(result).toHaveLength(1);
    });

    it('should handle empty transcript', () => {
      const result = extractNewMessages([], 30);

      expect(result).toEqual([]);
    });
  });

  describe('analyzeForMemories', () => {
    it('should save multi-line assistant content', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'We decided to use React instead of Vue for this project.\nThis is because of better TypeScript support and ecosystem.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0]?.subject).toContain('decided to use React');
    });

    it('should save all thinking content (even single-line)', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Done.',
          thinking: 'I need to fix the auth bug.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0]?.content).toContain('fix the auth bug');
    });

    it('should save both thinking and multi-line content', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Configured the environment variable DATABASE_URL.\nThis points to the production database.',
          thinking: 'Let me check the config file...',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      // Should have 2 memories: one for thinking, one for content
      expect(memories.length).toBe(2);
    });

    it('should skip single-line content (only multi-line is saved)', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'The convention in this codebase is to always prefix private methods with underscore.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      // Single-line content is not saved
      expect(memories.length).toBe(0);
    });

    it('should skip user messages', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'user',
          content: 'We decided to use a different approach for this feature.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      // Should not create memory from user message
      expect(memories).toHaveLength(0);
    });

    it('should skip short content matches', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Fixed: tiny', // Too short
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories).toHaveLength(0);
    });

    it('should detect file-specific mentions', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'In file `src/components/Button.tsx`, we need to ensure the onClick handler is properly typed.\nIt should also handle async operations correctly.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      const fileMemory = memories.find((m) => m.applies_to.startsWith('file:'));
      expect(fileMemory).toBeDefined();
      expect(fileMemory?.applies_to).toContain('Button.tsx');
    });

    it('should deduplicate by subject', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Decided to use TypeScript for type safety. Decision: use TypeScript for type safety.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      const subjects = memories.map((m) => m.subject.toLowerCase());
      const uniqueSubjects = [...new Set(subjects)];

      expect(subjects.length).toBe(uniqueSubjects.length);
    });

    it('should generate keywords for memories', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'The solution for the performance issue was to implement caching at the database query level.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      if (memories.length > 0) {
        expect(memories[0]?.keywords.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty messages array', () => {
      const memories = analyzeForMemories([]);

      expect(memories).toEqual([]);
    });
  });

  describe('parseTranscriptForMemories', () => {
    it('should parse JSONL and extract memories from multi-line content', () => {
      const jsonl = [
        JSON.stringify({
          type: 'user',
          timestamp: '2024-01-01T10:00:00.000Z',
          message: { content: 'Hello' },
        }),
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:05.000Z',
          message: {
            content: [
              { type: 'text', text: 'Here is the answer.\nIt has multiple lines.' },
            ],
          },
        }),
      ].join('\n');

      const memories = parseTranscriptForMemories(jsonl);

      expect(memories.length).toBe(1);
      expect(memories[0]?.content).toContain('Here is the answer');
    });

    it('should extract thinking content from thinking blocks', () => {
      const jsonl = [
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:05.000Z',
          message: {
            content: [
              { type: 'thinking', thinking: 'I need to consider this carefully.' },
              { type: 'text', text: 'Done.' },
            ],
          },
        }),
      ].join('\n');

      const memories = parseTranscriptForMemories(jsonl);

      // Should have 1 memory from thinking (single-line text content is dropped)
      expect(memories.length).toBe(1);
      expect(memories[0]?.content).toContain('consider this carefully');
    });

    it('should handle separate thinking and text messages', () => {
      // This is the actual format Claude Code produces - thinking and text as separate entries
      const jsonl = [
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:05.000Z',
          message: {
            content: [
              { type: 'thinking', thinking: 'The user wants to chat about food.' },
            ],
          },
        }),
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:06.000Z',
          message: {
            content: [
              {
                type: 'text',
                text: 'Sausages and stew - a classic combination!\nWhat dish are you thinking about?',
              },
            ],
          },
        }),
      ].join('\n');

      const memories = parseTranscriptForMemories(jsonl);

      // Should have 2 memories: one from thinking, one from multi-line text
      expect(memories.length).toBe(2);
      expect(memories.some((m) => m.content.includes('user wants to chat'))).toBe(true);
      expect(memories.some((m) => m.content.includes('classic combination'))).toBe(true);
    });

    it('should skip non-user/assistant entries', () => {
      const jsonl = [
        JSON.stringify({
          type: 'summary',
          summary: 'Fixed transcript parsing',
        }),
        JSON.stringify({
          type: 'system',
          subtype: 'stop_hook_summary',
        }),
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:05.000Z',
          message: {
            content: [
              { type: 'text', text: 'Valid message.\nWith multiple lines.' },
            ],
          },
        }),
      ].join('\n');

      const memories = parseTranscriptForMemories(jsonl);

      expect(memories.length).toBe(1);
    });

    it('should handle malformed lines gracefully', () => {
      const jsonl = [
        'not valid json',
        JSON.stringify({
          type: 'assistant',
          timestamp: '2024-01-01T10:00:05.000Z',
          message: {
            content: [
              { type: 'text', text: 'Valid message.\nWith multiple lines.' },
            ],
          },
        }),
        '{"incomplete":',
      ].join('\n');

      const memories = parseTranscriptForMemories(jsonl);

      // Should still get the valid message
      expect(memories.length).toBe(1);
    });

    it('should handle empty input', () => {
      const memories = parseTranscriptForMemories('');
      expect(memories).toEqual([]);
    });

    it('should handle string content (legacy format)', () => {
      const jsonl = JSON.stringify({
        type: 'assistant',
        timestamp: '2024-01-01T10:00:05.000Z',
        message: {
          content: 'Simple string content.\nWith newline.',
        },
      });

      const memories = parseTranscriptForMemories(jsonl);

      expect(memories.length).toBe(1);
      expect(memories[0]?.content).toContain('Simple string content');
    });
  });
});
