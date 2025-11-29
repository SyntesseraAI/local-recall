import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  stringSimilarity,
  fuzzyMatch,
  fuzzyFilter,
  fuzzyBestMatch,
  tokenize,
  tokenOverlapScore,
} from '../../../src/utils/fuzzy.js';

describe('fuzzy utilities', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should return correct distance for single character difference', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('should return correct distance for insertions', () => {
      expect(levenshteinDistance('hello', 'helloo')).toBe(1);
    });

    it('should return correct distance for deletions', () => {
      expect(levenshteinDistance('hello', 'helo')).toBe(1);
    });

    it('should return length difference for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should be symmetric', () => {
      expect(levenshteinDistance('abc', 'abd')).toBe(levenshteinDistance('abd', 'abc'));
    });
  });

  describe('stringSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(stringSimilarity('hello', 'hello')).toBe(1);
    });

    it('should return 0 for completely different strings of same length', () => {
      expect(stringSimilarity('abc', 'xyz')).toBe(0);
    });

    it('should return value between 0 and 1 for similar strings', () => {
      const score = stringSimilarity('hello', 'hallo');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });

    it('should be case-insensitive', () => {
      expect(stringSimilarity('Hello', 'hello')).toBe(1);
      expect(stringSimilarity('HELLO', 'hello')).toBe(1);
    });

    it('should handle empty strings', () => {
      expect(stringSimilarity('', '')).toBe(1);
      expect(stringSimilarity('hello', '')).toBe(0);
    });
  });

  describe('fuzzyMatch', () => {
    it('should match identical strings', () => {
      expect(fuzzyMatch('hello', 'hello')).toBe(true);
    });

    it('should match similar strings above threshold', () => {
      expect(fuzzyMatch('hello', 'hallo', 0.6)).toBe(true);
    });

    it('should not match dissimilar strings', () => {
      expect(fuzzyMatch('hello', 'world', 0.6)).toBe(false);
    });

    it('should use default threshold', () => {
      expect(fuzzyMatch('typescript', 'typescritp')).toBe(true);
    });

    it('should respect custom threshold', () => {
      expect(fuzzyMatch('hello', 'hallo', 0.9)).toBe(false);
      expect(fuzzyMatch('hello', 'hallo', 0.7)).toBe(true);
    });
  });

  describe('fuzzyFilter', () => {
    it('should filter items by fuzzy match', () => {
      const items = ['apple', 'banana', 'apricot', 'cherry'];
      const results = fuzzyFilter('aple', items, (x) => x, 0.6);

      expect(results.map((r) => r.item)).toContain('apple');
    });

    it('should return items with scores', () => {
      const items = ['cat', 'car', 'bat'];
      const results = fuzzyFilter('cat', items, (x) => x, 0.5);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.score).toBeDefined();
      expect(results[0]?.item).toBeDefined();
    });

    it('should sort by score descending', () => {
      const items = ['cat', 'car', 'cab', 'cot'];
      const results = fuzzyFilter('cat', items, (x) => x, 0.5);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
      }
    });

    it('should work with object accessor', () => {
      const items = [
        { name: 'apple', id: 1 },
        { name: 'banana', id: 2 },
        { name: 'apricot', id: 3 },
      ];
      const results = fuzzyFilter('aple', items, (x) => x.name, 0.6);

      expect(results.some((r) => r.item.name === 'apple')).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const items = ['apple', 'banana'];
      const results = fuzzyFilter('xyz', items, (x) => x, 0.8);

      expect(results).toEqual([]);
    });
  });

  describe('fuzzyBestMatch', () => {
    it('should return best matching item', () => {
      const items = ['cat', 'car', 'bat'];
      const result = fuzzyBestMatch('cat', items, (x) => x);

      expect(result?.item).toBe('cat');
      expect(result?.score).toBe(1);
    });

    it('should return null for empty array', () => {
      const result = fuzzyBestMatch('test', [], (x) => x);

      expect(result).toBeNull();
    });

    it('should return item with highest score', () => {
      const items = ['apple', 'application', 'apricot'];
      const result = fuzzyBestMatch('apple', items, (x) => x);

      expect(result?.item).toBe('apple');
    });

    it('should work with object accessor', () => {
      const items = [
        { value: 'hello' },
        { value: 'world' },
        { value: 'help' },
      ];
      const result = fuzzyBestMatch('help', items, (x) => x.value);

      expect(result?.item.value).toBe('help');
    });
  });

  describe('tokenize', () => {
    it('should split by whitespace', () => {
      const tokens = tokenize('hello world');

      expect(tokens).toEqual(['hello', 'world']);
    });

    it('should lowercase tokens', () => {
      const tokens = tokenize('Hello World');

      expect(tokens).toEqual(['hello', 'world']);
    });

    it('should remove punctuation', () => {
      const tokens = tokenize('hello, world!');

      expect(tokens).toEqual(['hello', 'world']);
    });

    it('should handle multiple spaces', () => {
      const tokens = tokenize('hello   world');

      expect(tokens).toEqual(['hello', 'world']);
    });

    it('should preserve hyphens', () => {
      const tokens = tokenize('user-friendly interface');

      expect(tokens).toContain('user-friendly');
    });

    it('should filter empty tokens', () => {
      const tokens = tokenize('  hello  ');

      expect(tokens).toEqual(['hello']);
    });

    it('should handle empty string', () => {
      const tokens = tokenize('');

      expect(tokens).toEqual([]);
    });
  });

  describe('tokenOverlapScore', () => {
    it('should return 1 for identical strings', () => {
      expect(tokenOverlapScore('hello world', 'hello world')).toBe(1);
    });

    it('should return 0 for no overlap', () => {
      expect(tokenOverlapScore('hello world', 'foo bar')).toBe(0);
    });

    it('should return partial score for partial overlap', () => {
      const score = tokenOverlapScore('hello world', 'hello there');

      expect(score).toBe(0.5); // 1 of 2 query tokens match
    });

    it('should handle empty query', () => {
      expect(tokenOverlapScore('', 'hello world')).toBe(0);
    });

    it('should be case-insensitive', () => {
      expect(tokenOverlapScore('Hello', 'hello')).toBe(1);
    });

    it('should handle repeated words in target', () => {
      const score = tokenOverlapScore('test', 'test test test');

      // The function counts ALL matches (3) divided by query tokens (1) = 3
      expect(score).toBe(3);
    });
  });
});
