import { describe, it, expect } from 'vitest';
import {
  extractVideoId,
  formatTranscriptAsText,
  formatTranscriptWithTimestamps,
} from '../src/utils/youtube.js';
import type { TranscriptEntry } from '../src/utils/youtube.js';

describe('extractVideoId', () => {
  it('should extract from direct video ID', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract from youtube.com/watch?v=', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract from youtu.be short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract from youtube.com/embed/', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract from youtube.com/shorts/', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('should extract from URL with extra params', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')).toBe('dQw4w9WgXcQ');
  });

  it('should throw on invalid input', () => {
    expect(() => extractVideoId('not-a-valid-id')).toThrow('Invalid YouTube URL or video ID');
  });

  it('should throw on random URL', () => {
    expect(() => extractVideoId('https://example.com/page')).toThrow('Invalid YouTube URL or video ID');
  });
});

describe('formatTranscriptAsText', () => {
  const entries: TranscriptEntry[] = [
    { text: 'Hello', offset: 0, duration: 1000 },
    { text: 'world', offset: 1000, duration: 1000 },
    { text: 'foo', offset: 2000, duration: 1000 },
  ];

  it('should join text with spaces', () => {
    expect(formatTranscriptAsText(entries)).toBe('Hello world foo');
  });

  it('should return empty string for empty array', () => {
    expect(formatTranscriptAsText([])).toBe('');
  });
});

describe('formatTranscriptWithTimestamps', () => {
  it('should format with mm:ss for short videos', () => {
    const entries: TranscriptEntry[] = [
      { text: 'Hello', offset: 0, duration: 1000 },
      { text: 'world', offset: 65000, duration: 1000 },
    ];

    const result = formatTranscriptWithTimestamps(entries);
    expect(result).toBe('[0:00] Hello\n[1:05] world');
  });

  it('should format with h:mm:ss for long videos', () => {
    const entries: TranscriptEntry[] = [
      { text: 'Start', offset: 0, duration: 1000 },
      { text: 'Later', offset: 3661000, duration: 1000 },
    ];

    const result = formatTranscriptWithTimestamps(entries);
    expect(result).toBe('[0:00] Start\n[1:01:01] Later');
  });

  it('should return empty string for empty array', () => {
    expect(formatTranscriptWithTimestamps([])).toBe('');
  });
});
