/**
 * Fuzzy string matching utilities
 *
 * This module provides low-level fuzzy matching algorithms.
 * For most use cases, use the SearchEngine class instead which
 * uses Fuse.js for comprehensive fuzzy search.
 */

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming with a 2D matrix.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Create a 2D array to store distances
  // Initialized with all zeros, then first row/column set to incremental values
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= n; j++) {
    const row = dp[0];
    if (row) row[j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const currentRow = dp[i];
      const prevRow = dp[i - 1];

      if (currentRow && prevRow) {
        const deletion = (prevRow[j] ?? 0) + 1;
        const insertion = (currentRow[j - 1] ?? 0) + 1;
        const substitution = (prevRow[j - 1] ?? 0) + cost;
        currentRow[j] = Math.min(deletion, insertion, substitution);
      }
    }
  }

  return dp[m]?.[n] ?? Math.max(m, n);
}

/**
 * Calculate normalized similarity score (0-1)
 * 1 = exact match, 0 = completely different
 */
export function stringSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1; // Both empty strings are identical
  }

  return 1 - distance / maxLength;
}

/**
 * Check if a string fuzzy-matches another with a threshold
 */
export function fuzzyMatch(
  query: string,
  target: string,
  threshold: number = 0.6
): boolean {
  return stringSimilarity(query, target) >= threshold;
}

/**
 * Find all fuzzy matches in an array of strings
 */
export function fuzzyFilter<T>(
  query: string,
  items: T[],
  accessor: (item: T) => string,
  threshold: number = 0.6
): Array<{ item: T; score: number }> {
  const results: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const target = accessor(item);
    const score = stringSimilarity(query, target);

    if (score >= threshold) {
      results.push({ item, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Find the best match in an array
 */
export function fuzzyBestMatch<T>(
  query: string,
  items: T[],
  accessor: (item: T) => string
): { item: T; score: number } | null {
  let bestItem: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const target = accessor(item);
    const score = stringSimilarity(query, target);

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem === null) {
    return null;
  }

  return { item: bestItem, score: bestScore };
}

/**
 * Tokenize a string into searchable tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Calculate token overlap score between query and target
 */
export function tokenOverlapScore(query: string, target: string): number {
  const queryTokens = new Set(tokenize(query));
  const targetTokens = tokenize(target);

  if (queryTokens.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const token of targetTokens) {
    if (queryTokens.has(token)) {
      matches++;
    }
  }

  return matches / queryTokens.size;
}
