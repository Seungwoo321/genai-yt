import ora from 'ora';
import chalk from 'chalk';
import { fetchTranscript, formatTranscriptAsText } from '../utils/youtube.js';
import { createProvider } from '../providers/index.js';
import { getPrompt } from '../prompts/templates.js';
import type { ProviderType } from '../providers/types.js';
import type { ActionType } from '../prompts/templates.js';

interface AnalyzeOptions {
  provider: ProviderType;
  model?: string;
  lang?: string;
  transcriptLang?: string;
  prompt?: string;
}

export async function analyzeCommand(
  action: ActionType,
  url: string,
  options: AnalyzeOptions
): Promise<void> {
  const spinner = ora('Fetching transcript...').start();

  let transcript: string;
  try {
    const entries = await fetchTranscript(url, options.transcriptLang);
    transcript = formatTranscriptAsText(entries);
    spinner.succeed(`Transcript fetched (${transcript.length} chars)`);
  } catch (error) {
    spinner.fail('Failed to fetch transcript');
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  const provider = createProvider(options.provider, { model: options.model });
  const prompt = getPrompt(action, { lang: options.lang, customPrompt: options.prompt });

  const aiSpinner = ora(`Processing with ${chalk.cyan(options.provider)}...`).start();

  try {
    const response = await provider.generate(prompt, transcript);
    aiSpinner.stop();

    console.log('');
    console.log(response.text);
  } catch (error) {
    aiSpinner.fail('AI processing failed');
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
