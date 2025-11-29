import { describe, it, expect } from 'vitest';
import {
  parseTranscript,
  extractNewMessages,
  analyzeForMemories,
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

    it('should validate message roles', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'invalid',
            content: 'Hello',
            timestamp: '2024-01-01T10:00:00.000Z',
          },
        ],
      });

      expect(() => parseTranscript(input)).toThrow(/Invalid transcript message/);
    });

    it('should validate message content is string', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'user',
            content: 123,
            timestamp: '2024-01-01T10:00:00.000Z',
          },
        ],
      });

      expect(() => parseTranscript(input)).toThrow(/Invalid transcript message/);
    });

    it('should validate timestamp is valid ISO date', () => {
      const input = JSON.stringify({
        transcript: [
          {
            role: 'user',
            content: 'Hello',
            timestamp: 'not-a-date',
          },
        ],
      });

      expect(() => parseTranscript(input)).toThrow(/Invalid transcript message/);
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

    it('should report which message index is invalid', () => {
      const input = JSON.stringify({
        transcript: [
          { role: 'user', content: 'Valid', timestamp: '2024-01-01T10:00:00.000Z' },
          { role: 'invalid', content: 'Invalid', timestamp: '2024-01-01T10:00:00.000Z' },
        ],
      });

      expect(() => parseTranscript(input)).toThrow(/at index 1/);
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
    it('should detect decision patterns', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'We decided to use React instead of Vue for this project because of better TypeScript support.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
      expect(memories.some((m) => m.subject.includes('Decision'))).toBe(true);
    });

    it('should detect solution patterns', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Fixed the authentication bug by adding proper token validation in the middleware.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
      expect(memories.some((m) => m.subject.includes('Fix'))).toBe(true);
    });

    it('should detect configuration patterns', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'Configured the environment variable DATABASE_URL to point to the production database.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
    });

    it('should detect convention patterns', () => {
      const messages: TranscriptMessage[] = [
        {
          role: 'assistant',
          content: 'The convention in this codebase is to always prefix private methods with underscore.',
          timestamp: new Date().toISOString(),
        },
      ];

      const memories = analyzeForMemories(messages);

      expect(memories.length).toBeGreaterThan(0);
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
          content: 'In file `src/components/Button.tsx`, we need to ensure the onClick handler is properly typed and handles async operations correctly.',
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
});
