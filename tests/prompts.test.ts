import { describe, it, expect } from 'vitest';
import { getPrompt } from '../src/prompts/templates.js';

describe('getPrompt', () => {
  it('should return summary prompt', () => {
    const prompt = getPrompt('summary');
    expect(prompt).toContain('summarizer');
    expect(prompt).toContain('Summary');
    expect(prompt).toContain('Key Points');
  });

  it('should return insights prompt', () => {
    const prompt = getPrompt('insights');
    expect(prompt).toContain('insight');
    expect(prompt).toContain('Key Insights');
    expect(prompt).toContain('Action Items');
  });

  it('should return translate prompt', () => {
    const prompt = getPrompt('translate');
    expect(prompt).toContain('translator');
  });

  it('should append target language for translate', () => {
    const prompt = getPrompt('translate', { lang: 'ko' });
    expect(prompt).toContain('Target language: ko');
  });

  it('should not append language for non-translate actions', () => {
    const prompt = getPrompt('summary', { lang: 'ko' });
    expect(prompt).not.toContain('Target language');
  });

  it('should return memo prompt', () => {
    const prompt = getPrompt('memo');
    expect(prompt).toContain('note-taker');
    expect(prompt).toContain('Key Topics');
  });

  it('should return custom prompt when provided', () => {
    const prompt = getPrompt('custom', { customPrompt: 'Extract all names' });
    expect(prompt).toBe('Extract all names');
  });

  it('should return default custom prompt when none provided', () => {
    const prompt = getPrompt('custom');
    expect(prompt).toContain('Analyze');
  });
});
