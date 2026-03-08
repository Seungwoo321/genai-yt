import type { AIProvider, ProviderResponse, ProviderOptions } from './types.js';
import { execCommand } from '../utils/exec.js';

export class CursorCLIProvider implements AIProvider {
  readonly name = 'cursor-cli' as const;
  private timeout: number;
  private model: string;

  constructor(options?: ProviderOptions) {
    this.timeout = options?.timeout ?? 180000;
    this.model = options?.model ?? 'claude-4.5-sonnet';
  }

  async generate(prompt: string, input: string): Promise<ProviderResponse> {
    const fullInput = `${prompt}\n\n---\n\n${input}`;

    const result = await execCommand(
      'agent',
      ['-p', '--trust', '--model', this.model, '--output-format', 'text'],
      {
        input: fullInput,
        timeout: this.timeout,
      }
    );

    if (result.exitCode !== 0) {
      throw new Error(`Cursor CLI failed: ${result.stderr}`);
    }

    return { text: result.stdout };
  }
}
