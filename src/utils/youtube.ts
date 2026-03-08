import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptEntry {
  text: string;
  offset: number;
  duration: number;
}

export function extractVideoId(urlOrId: string): string {
  // Direct video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  try {
    const url = new URL(urlOrId);

    // youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = url.searchParams.get('v');
    if (v) return v;

    // youtube.com/embed/VIDEO_ID or youtube.com/v/VIDEO_ID
    const match = url.pathname.match(/\/(embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[2];
  } catch {
    // not a URL
  }

  throw new Error(`Invalid YouTube URL or video ID: ${urlOrId}`);
}

export async function fetchTranscript(
  urlOrId: string,
  lang?: string
): Promise<TranscriptEntry[]> {
  const videoId = extractVideoId(urlOrId);

  const config: { lang?: string } = {};
  if (lang) config.lang = lang;

  const items = await YoutubeTranscript.fetchTranscript(videoId, config);

  return items.map((item) => ({
    text: item.text,
    offset: item.offset,
    duration: item.duration,
  }));
}

export function formatTranscriptAsText(entries: TranscriptEntry[]): string {
  return entries.map((e) => e.text).join(' ');
}

export function formatTranscriptWithTimestamps(entries: TranscriptEntry[]): string {
  return entries
    .map((e) => {
      const totalSeconds = Math.floor(e.offset / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      const timestamp = h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`;

      return `[${timestamp}] ${e.text}`;
    })
    .join('\n');
}
