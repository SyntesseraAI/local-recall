import { describe, it, expect } from 'vitest';
import { summarizeText, summarizeToString, generateSubject } from '../../../src/utils/summarize.js';

describe('summarize utilities', () => {
  const sampleText = `
    The TextRank algorithm is a graph-based ranking algorithm for text processing.
    It can be used for keyword extraction and extractive summarization.
    The algorithm builds a graph of text units and ranks them based on their importance.
    TextRank is inspired by Google's PageRank algorithm.
    It uses the structure of the text to determine which sentences are most relevant.
    The algorithm works by computing similarity between sentences.
    Sentences with high similarity to many other sentences are ranked higher.
    This makes it effective for identifying key information in documents.
  `;

  describe('summarizeText', () => {
    it('should extract sentences from text', () => {
      const result = summarizeText(sampleText, { sentenceCount: 3 });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result.every((s) => typeof s === 'string')).toBe(true);
    });

    it('should respect sentenceRatio option', () => {
      // Note: ts-textrank requires ratio to be 0 < ratio < 0.5
      const result = summarizeText(sampleText, { sentenceRatio: 0.4 });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty text', () => {
      const result = summarizeText('', { sentenceCount: 3 });

      expect(result).toEqual([]);
    });

    it('should handle single sentence text', () => {
      const result = summarizeText('This is a single sentence.', { sentenceCount: 1 });

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should support different sort modes', () => {
      const byScore = summarizeText(sampleText, { sentenceCount: 3, sortMode: 'score' });
      const byOccurrence = summarizeText(sampleText, { sentenceCount: 3, sortMode: 'occurrence' });

      expect(byScore).toBeInstanceOf(Array);
      expect(byOccurrence).toBeInstanceOf(Array);
    });
  });

  describe('summarizeToString', () => {
    it('should return summary as a single string', () => {
      const result = summarizeToString(sampleText, { sentenceCount: 2 });

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty string for empty text', () => {
      const result = summarizeToString('', { sentenceCount: 2 });

      expect(result).toBe('');
    });
  });

  describe('generateSubject', () => {
    it('should generate a brief subject from text', () => {
      const result = generateSubject(sampleText);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should respect maxLength option', () => {
      const result = generateSubject(sampleText, 50);

      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should truncate with ellipsis if needed', () => {
      const longText = 'This is a very long sentence that should be truncated when generating a subject line because it exceeds the maximum length.';
      const result = generateSubject(longText, 30);

      expect(result.length).toBeLessThanOrEqual(30);
      if (result.length === 30) {
        expect(result.endsWith('...')).toBe(true);
      }
    });

    it('should handle empty text', () => {
      const result = generateSubject('');

      expect(typeof result).toBe('string');
    });

    it('should use first line as fallback for very short text', () => {
      const shortText = 'Short text';
      const result = generateSubject(shortText);

      expect(result).toBe('Short text');
    });
  });
});
