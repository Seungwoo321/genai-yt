import type { AIProvider, ProviderResponse, ProviderOptions } from './types.js';
import { execCommand, execSimple } from '../utils/exec.js';

export class ClaudeCodeProvider implements AIProvider {
  readonly name = 'claude-code' as const;
  private timeout: number;
  private model: string;

  constructor(options?: ProviderOptions) {
    this.timeout = options?.timeout ?? 180000;
    this.model = options?.model ?? 'haiku';
  }

  async generate(prompt: string, input: string): Promise<ProviderResponse> {
    const fullPrompt = `${prompt}\n\n---\n\n${input}`;

    const args = [
      '-p',
      '--model', this.model,
      '--output-format', 'text',
    ];

    const result = await execCommand('claude', args, {
      input: fullPrompt,
      timeout: this.timeout,
    });

    if (result.exitCode !== 0) {
      throw new Error(`Claude CLI failed: ${result.stderr}`);
    }

    return { text: result.stdout };
  }

  static async isAvailable(): Promise<boolean> {
    try {
      await execSimple('claude', ['--version'], { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}
