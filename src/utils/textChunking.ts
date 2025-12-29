// src/utils/textChunking.ts

import { TextChunk } from '../types/models';

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): TextChunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  
  let offset = 0;
  return paragraphs.map((content, index) => {
    const chunk: TextChunk = {
      type: 'paragraph',
      content: content.trim(),
      index,
      startOffset: offset,
      endOffset: offset + content.length,
    };
    offset += content.length + 2; // +2 for \n\n
    return chunk;
  });
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): TextChunk[] {
  // Simple sentence splitting (can be improved with NLP libraries)
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = text.match(sentenceRegex) || [text];
  
  let offset = 0;
  return sentences.map((content, index) => {
    const trimmed = content.trim();
    const chunk: TextChunk = {
      type: 'sentence',
      content: trimmed,
      index,
      startOffset: offset,
      endOffset: offset + trimmed.length,
    };
    offset += content.length;
    return chunk;
  });
}

/**
 * Split paragraph into sentences
 */
export function splitParagraphIntoSentences(paragraph: string): string[] {
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = paragraph.match(sentenceRegex) || [paragraph];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Get sentence at position
 */
export function getSentenceAtPosition(
  text: string,
  position: number
): { sentence: string; index: number; start: number; end: number } | null {
  const sentences = splitIntoSentences(text);
  
  for (const chunk of sentences) {
    if (position >= chunk.startOffset && position <= chunk.endOffset) {
      return {
        sentence: chunk.content,
        index: chunk.index,
        start: chunk.startOffset,
        end: chunk.endOffset,
      };
    }
  }
  
  return null;
}

/**
 * Clean text for TTS (remove special characters, formatting)
 */
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[*_~`]/g, '') // Remove markdown formatting
    .trim();
}
