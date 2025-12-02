/**
 * Local Recall - Main Entry Point
 *
 * A local markdown-powered memory system for AI coding assistants.
 */

// Core exports
export { MemoryManager } from './core/memory.js';
export { SearchEngine } from './core/search.js';
export { VectorStore, getVectorStore } from './core/vector-store.js';

// Type exports
export type {
  Memory,
  MemoryFrontmatter,
  MemoryScope,
  CreateMemoryInput,
  SearchResult,
  SearchOptions,
  Config,
  TranscriptMessage,
  TranscriptInput,
} from './core/types.js';

// Utility exports
export { loadConfig, getConfig, validateConfig } from './utils/config.js';
export {
  parseMarkdown,
  serializeMemory,
  extractKeywordsFromText,
  formatMemoryForDisplay,
} from './utils/markdown.js';
export {
  parseTranscript,
  extractNewMessages,
  analyzeForMemories,
} from './utils/transcript.js';
export {
  levenshteinDistance,
  stringSimilarity,
  fuzzyMatch,
  fuzzyFilter,
  fuzzyBestMatch,
} from './utils/fuzzy.js';
