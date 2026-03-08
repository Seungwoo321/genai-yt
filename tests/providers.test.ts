import { describe, it, expect } from 'vitest';
import { createProvider } from '../src/providers/index.js';

describe('createProvider', () => {
  it('should create claude-code provider', () => {
    const provider = createProvider('claude-code');
    expect(provider.name).toBe('claude-code');
  });

  it('should create cursor-cli provider', () => {
    const provider = createProvider('cursor-cli');
    expect(provider.name).toBe('cursor-cli');
  });

  it('should throw on unknown provider', () => {
    expect(() => createProvider('unknown' as any)).toThrow('Unknown provider');
  });
});
