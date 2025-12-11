export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  readingTime: number; // in minutes
}

export function calculateTextStats(text: string): TextStats {
  // Remove markdown syntax for more accurate counts
  const plainText = text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]*`/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove headings markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');

  // Count words (split by whitespace and filter empty strings)
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Count characters
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Calculate reading time (average reading speed: 200 words per minute)
  const readingTime = Math.ceil(words / 200);

  return {
    words,
    characters,
    charactersNoSpaces,
    readingTime,
  };
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
