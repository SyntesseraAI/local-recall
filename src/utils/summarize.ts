/**
 * Options for text summarization
 */
export interface SummarizeOptions {
  /** Maximum number of sentences to extract */
  sentenceCount?: number;
  /** Maximum length of output (default: unlimited) */
  maxLength?: number;
}

/**
 * Extract sentences from text
 *
 * @param text - The text to extract sentences from
 * @param options - Options for extraction
 * @returns Array of extracted sentences
 */
export function summarizeText(text: string, options: SummarizeOptions = {}): string[] {
  const { sentenceCount } = options;

  // Split on sentence boundaries (. ! ?) followed by whitespace or end
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentenceCount !== undefined && sentenceCount > 0) {
    return sentences.slice(0, sentenceCount);
  }

  return sentences;
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
 * - Multi-line text: takes the first line
 * - Single-line text: takes up to the first period, or all text if no period
 *
 * Truncates to maxLength if needed.
 *
 * @param text - The text to generate a subject from
 * @param maxLength - Maximum length of the subject (default: 200)
 * @returns A brief subject line
 */
export function generateSubject(text: string, maxLength: number = 200): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  // Check if multi-line
  const newlineIndex = trimmed.indexOf('\n');
  let subject: string;

  if (newlineIndex !== -1) {
    // Multi-line: take first line
    subject = trimmed.substring(0, newlineIndex).trim();
  } else {
    // Single line: take up to first period, or all text
    const periodIndex = trimmed.indexOf('.');
    subject = periodIndex !== -1 ? trimmed.substring(0, periodIndex) : trimmed;
  }

  // Truncate if needed
  if (subject.length <= maxLength) {
    return subject;
  }

  return subject.substring(0, maxLength - 3) + '...';
}
