#!/usr/bin/env node
import { Command } from 'commander';
import { transcriptCommand } from './commands/transcript.js';
import { analyzeCommand } from './commands/analyze.js';
import type { ProviderType } from './providers/types.js';
import type { ActionType } from './prompts/templates.js';

const program = new Command();

program
  .name('genai-yt')
  .description('AI-powered YouTube transcript extractor and analyzer')
  .version('0.1.0');

// transcript: raw transcript extraction (no AI needed)
program
  .command('transcript <url>')
  .description('Extract raw transcript from a YouTube video')
  .option('--lang <lang>', 'Transcript language (e.g., ko, en, ja)')
  .option('--timestamps', 'Include timestamps', false)
  .action(transcriptCommand);

// AI-powered commands share common options
function addAIOptions(cmd: Command): Command {
  return cmd
    .requiredOption('-p, --provider <provider>', 'AI provider (claude-code or cursor-cli)')
    .option('--model <model>', 'Model to use')
    .option('--transcript-lang <lang>', 'Transcript language (e.g., ko, en, ja)');
}

// summary
addAIOptions(
  program
    .command('summary <url>')
    .description('Summarize a YouTube video')
)
  .action((url: string, options: { provider: ProviderType; model?: string; transcriptLang?: string }) => {
    return analyzeCommand('summary', url, options);
  });

// insights
addAIOptions(
  program
    .command('insights <url>')
    .description('Extract key insights from a YouTube video')
)
  .action((url: string, options: { provider: ProviderType; model?: string; transcriptLang?: string }) => {
    return analyzeCommand('insights', url, options);
  });

// translate
addAIOptions(
  program
    .command('translate <url>')
    .description('Translate a YouTube video transcript')
)
  .option('--lang <lang>', 'Target language (e.g., en, ko, ja)', 'en')
  .action((url: string, options: { provider: ProviderType; model?: string; transcriptLang?: string; lang?: string }) => {
    return analyzeCommand('translate', url, options);
  });

// memo
addAIOptions(
  program
    .command('memo <url>')
    .description('Convert a YouTube video into organized notes')
)
  .action((url: string, options: { provider: ProviderType; model?: string; transcriptLang?: string }) => {
    return analyzeCommand('memo', url, options);
  });

// custom: user-defined prompt
addAIOptions(
  program
    .command('ask <url>')
    .description('Ask a custom question about a YouTube video')
)
  .requiredOption('--prompt <prompt>', 'Custom prompt to apply to the transcript')
  .action((url: string, options: { provider: ProviderType; model?: string; transcriptLang?: string; prompt: string }) => {
    return analyzeCommand('custom' as ActionType, url, options);
  });

// Help examples
program.addHelpText(
  'after',
  `
Examples:
  $ genai-yt transcript <url>                              # Raw transcript
  $ genai-yt transcript <url> --timestamps                 # With timestamps
  $ genai-yt summary <url> -p claude-code                  # AI summary
  $ genai-yt insights <url> -p cursor-cli                  # Key insights
  $ genai-yt translate <url> -p claude-code --lang en       # Translate to English
  $ genai-yt memo <url> -p claude-code                     # Organized notes
  $ genai-yt ask <url> -p claude-code --prompt "이 영상에서 투자 관련 조언만 추출해줘"
`
);

program.parse();
