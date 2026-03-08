export type ProviderType = 'claude-code' | 'cursor-cli';

export interface ProviderOptions {
  model?: string;
  timeout?: number;
}

export interface ProviderResponse {
  text: string;
  sessionId?: string;
}

export interface AIProvider {
  readonly name: ProviderType;
  generate(prompt: string, input: string): Promise<ProviderResponse>;
}
