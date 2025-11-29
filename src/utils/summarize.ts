import {
  Summarizer,
  RelativeSummarizerConfig,
  AbsoluteSummarizerConfig,
  SorensenDiceSimilarity,
  DefaultTextParser,
  NullLogger,
} from 'ts-textrank';

/**
 * Options for text summarization
 */
export interface SummarizeOptions {
  /** Number of sentences to extract (absolute mode) */
  sentenceCount?: number;
  /** Ratio of sentences to extract, 0 < ratio < 0.5 (relative mode, default 0.3) */
  sentenceRatio?: number;
  /** Language for text parsing (default: 'en') */
  language?: string;
  /** Sort mode: 'score' for relevance, 'occurrence' for original order */
  sortMode?: 'score' | 'occurrence';
}

/**
 * Summarize text using TextRank algorithm
 *
 * TextRank is a graph-based ranking algorithm that extracts the most
 * important sentences from a text. It works by:
 * 1. Building a graph where sentences are nodes
 * 2. Connecting sentences based on similarity (Sorensen-Dice coefficient)
 * 3. Ranking sentences using a PageRank-like algorithm
 * 4. Extracting top-ranked sentences as the summary
 *
 * @param text - The text to summarize
 * @param options - Summarization options
 * @returns Array of extracted sentences forming the summary
 */
export function summarizeText(text: string, options: SummarizeOptions = {}): string[] {
  const {
    sentenceCount,
    sentenceRatio = 0.3,
    language = 'en',
    sortMode = 'occurrence',
  } = options;

  // Use absolute config if sentenceCount is specified, otherwise relative
  const similarity = new SorensenDiceSimilarity();
  const parser = new DefaultTextParser();
  const dampingFactor = 0.85; // Standard PageRank damping factor
  const sortModeValue = sortMode === 'score' ? Summarizer.SORT_SCORE : Summarizer.SORT_OCCURENCE;

  const config = sentenceCount !== undefined
    ? new AbsoluteSummarizerConfig(sentenceCount, similarity, parser, dampingFactor, sortModeValue)
    : new RelativeSummarizerConfig(sentenceRatio, similarity, parser, dampingFactor, sortModeValue);

  const summarizer = new Summarizer(config, new NullLogger());

  return summarizer.summarize(text, language);
}

/**
 * Summarize text and return as a single string
 *
 * @param text - The text to summarize
 * @param options - Summarization options
 * @returns Summary as a single string with sentences joined
 */
export function summarizeToString(text: string, options: SummarizeOptions = {}): string {
  const sentences = summarizeText(text, options);
  return sentences.join(' ');
}

/**
 * Generate a brief subject line from text
 *
 * Extracts the single most important sentence and truncates if needed.
 *
 * @param text - The text to generate a subject from
 * @param maxLength - Maximum length of the subject (default: 100)
 * @returns A brief subject line
 */
export function generateSubject(text: string, maxLength: number = 100): string {
  const sentences = summarizeText(text, { sentenceCount: 1, sortMode: 'score' });

  if (sentences.length === 0) {
    // Fallback: use first line or truncated text
    const firstLine = text.split(/[.\n]/)[0]?.trim() ?? text.trim();
    return firstLine.length <= maxLength
      ? firstLine
      : firstLine.substring(0, maxLength - 3) + '...';
  }

  const subject = sentences[0] ?? '';
  return subject.length <= maxLength
    ? subject
    : subject.substring(0, maxLength - 3) + '...';
}
