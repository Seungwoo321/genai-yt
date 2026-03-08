import type { AIProvider, ProviderType, ProviderOptions } from './types.js';
import { ClaudeCodeProvider } from './claude.js';
import { CursorCLIProvider } from './cursor.js';

export function createProvider(type: ProviderType, options?: ProviderOptions): AIProvider {
  switch (type) {
    case 'claude-code':
      return new ClaudeCodeProvider(options);
    case 'cursor-cli':
      return new CursorCLIProvider(options);
    default:
      throw new Error(`Unknown provider: ${type}. Use 'claude-code' or 'cursor-cli'`);
  }
}

export type { AIProvider, ProviderType, ProviderOptions, ProviderResponse } from './types.js';
