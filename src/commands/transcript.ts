import ora from 'ora';
import { fetchTranscript, formatTranscriptAsText, formatTranscriptWithTimestamps } from '../utils/youtube.js';

interface TranscriptOptions {
  lang?: string;
  timestamps?: boolean;
}

export async function transcriptCommand(url: string, options: TranscriptOptions): Promise<void> {
  const spinner = ora('Fetching transcript...').start();

  try {
    const entries = await fetchTranscript(url, options.lang);
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
