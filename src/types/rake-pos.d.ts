declare module 'rake-pos' {
  export interface ExtractOptions {
    text: string;
    language?: string;
    additionalStopWordSet?: Set<string>;
    posAllowedSet?: Set<string>;
    minCharLength?: number;
    maxWordsLength?: number;
    minKeywordFrequency?: number;
  }

  export function extractWithRakePos(options: ExtractOptions): string[];
  export default extractWithRakePos;
}
