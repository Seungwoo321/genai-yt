/**
 * Speech-to-Text fallback using yt-dlp + whisper-cpp (local, no API key needed)
 *
 * Prerequisites:
 *   brew install yt-dlp whisper-cpp ffmpeg
 *   Download a model: https://huggingface.co/ggerganov/whisper.cpp/tree/main
 */

import { execCommand } from './exec.js';
import { extractVideoId } from './youtube.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync, existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import type { TranscriptEntry } from './youtube.js';

const DEFAULT_MODEL_PATHS = [
  join(homedir(), '.local', 'share', 'whisper-cpp', 'ggml-large-v3-turbo.bin'),
  join(homedir(), '.local', 'share', 'whisper-cpp', 'ggml-base.bin'),
  join(homedir(), '.local', 'share', 'whisper-cpp', 'ggml-small.bin'),
  join(homedir(), '.local', 'share', 'whisper-cpp', 'ggml-medium.bin'),
  join(homedir(), '.local', 'share', 'whisper-cpp', 'ggml-large-v3.bin'),
];

/**
 * Check if yt-dlp is installed
 */
export async function isYtDlpAvailable(): Promise<boolean> {
  try {
    const result = await execCommand('yt-dlp', ['--version'], { timeout: 5000 });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Check if whisper-cpp is installed
 */
export async function isWhisperAvailable(): Promise<boolean> {
  try {
    const result = await execCommand('whisper-cli', ['--help'], { timeout: 5000 });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * Find whisper model file
 */
function findModelPath(customPath?: string): string | null {
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // Check WHISPER_MODEL env
  const envModel = process.env.WHISPER_MODEL;
  if (envModel && existsSync(envModel)) {
    return envModel;
  }

  // Search default paths
  for (const p of DEFAULT_MODEL_PATHS) {
    if (existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Download audio from YouTube video using yt-dlp
 */
export async function downloadAudio(urlOrId: string): Promise<string> {
  const videoId = extractVideoId(urlOrId);
  const outputPath = join(tmpdir(), `genai-yt-${videoId}`);
  const audioFile = `${outputPath}.wav`;

  // Clean up if exists
  if (existsSync(audioFile)) {
    unlinkSync(audioFile);
  }

  // Download and convert to 16kHz WAV (required by whisper-cpp)
  const result = await execCommand('yt-dlp', [
    '-x',
    '--audio-format', 'wav',
    '--postprocessor-args', 'ffmpeg:-ar 16000 -ac 1',
    '-o', `${outputPath}.%(ext)s`,
    '--no-playlist',
    `https://www.youtube.com/watch?v=${videoId}`,
  ], { timeout: 120000 });

  if (result.exitCode !== 0) {
    throw new Error(`yt-dlp failed: ${result.stderr}`);
  }

  if (!existsSync(audioFile)) {
    throw new Error('Audio file was not created. Make sure ffmpeg is installed: brew install ffmpeg');
  }

  return audioFile;
}

/**
 * Transcribe audio using whisper-cpp (local)
 */
export async function transcribeWithWhisper(
  audioPath: string,
  lang?: string
): Promise<TranscriptEntry[]> {
  const modelPath = findModelPath();
  if (!modelPath) {
    throw new Error(
      'Whisper model not found. Download one:\n' +
      '  mkdir -p ~/.local/share/whisper-cpp\n' +
      '  cd ~/.local/share/whisper-cpp\n' +
      '  curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin\n' +
      '\nOr set WHISPER_MODEL=/path/to/model.bin'
    );
  }

  const outputBase = audioPath.replace(/\.wav$/, '');

  const args = [
    '--model', modelPath,
    '--file', audioPath,
    '--output-json',
    '--output-file', outputBase,
    '--max-len', '80',
    '--split-on-word',
  ];

  if (lang) {
    args.push('--language', lang);
  }

  const result = await execCommand('whisper-cli', args, { timeout: 600000 });

  if (result.exitCode !== 0) {
    throw new Error(`whisper-cli failed: ${result.stderr}`);
  }

  // Parse JSON output
  const jsonPath = `${outputBase}.json`;
  if (!existsSync(jsonPath)) {
    // Fallback: use stdout
    const text = result.stdout.trim();
    if (!text) return [];
    return [{ text, offset: 0, duration: 0 }];
  }

  try {
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    const entries: TranscriptEntry[] = [];

    if (json.transcription) {
      for (const segment of json.transcription) {
        const text = segment.text?.trim();
        if (!text) continue;

        // Parse timestamp like "00:00:00,000"
        const startMs = parseTimestamp(segment.timestamps?.from || '00:00:00,000');

        entries.push({
          text,
          offset: startMs,
          duration: 0,
        });
      }
    }

    // Clean up json file
    unlinkSync(jsonPath);

    return entries;
  } catch {
    return [{ text: result.stdout.trim(), offset: 0, duration: 0 }];
  }
}

/**
 * Parse whisper timestamp "HH:MM:SS,mmm" to milliseconds
 */
function parseTimestamp(ts: string): number {
  const match = ts.match(/(\d+):(\d+):(\d+),(\d+)/);
  if (!match) return 0;

  const [, h, m, s, ms] = match;
  return (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)) * 1000 + parseInt(ms);
}

/**
 * Full STT pipeline: download audio → transcribe with whisper-cpp
 */
export async function fetchTranscriptViaStt(
  urlOrId: string,
  lang?: string
): Promise<TranscriptEntry[]> {
  const audioPath = await downloadAudio(urlOrId);

  try {
    return await transcribeWithWhisper(audioPath, lang);
  } finally {
    // Clean up audio file
    if (existsSync(audioPath)) {
      unlinkSync(audioPath);
    }
  }
}
