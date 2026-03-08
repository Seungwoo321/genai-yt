import ora from 'ora';
import { fetchTranscript, formatTranscriptAsText, formatTranscriptWithTimestamps } from '../utils/youtube.js';
import { isYtDlpAvailable, fetchTranscriptViaStt } from '../utils/stt.js';

interface TranscriptOptions {
  lang?: string;
  timestamps?: boolean;
}

export async function transcriptCommand(url: string, options: TranscriptOptions): Promise<void> {
  const spinner = ora('Fetching transcript...').start();

  try {
    let entries = await fetchTranscript(url, options.lang);

    // Fallback: yt-dlp + Whisper STT
    if (entries.length === 0) {
      spinner.text = 'No subtitles found. Trying speech-to-text (yt-dlp + Whisper)...';

      if (!(await isYtDlpAvailable())) {
        spinner.fail('No subtitles available and yt-dlp is not installed.\nInstall with: brew install yt-dlp');
        process.exit(1);
      }

      entries = await fetchTranscriptViaStt(url, options.lang);
    }

    if (entries.length === 0) {
      spinner.fail('Failed to extract transcript');
      process.exit(1);
    }

    spinner.stop();

    const output = options.timestamps
      ? formatTranscriptWithTimestamps(entries)
      : formatTranscriptAsText(entries);

    console.log(output);
  } catch (error) {
    spinner.fail('Failed to fetch transcript');
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
