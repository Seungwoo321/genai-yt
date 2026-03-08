export type ActionType = 'summary' | 'insights' | 'translate' | 'memo' | 'custom';

const PROMPTS: Record<Exclude<ActionType, 'custom'>, string> = {
  summary: `You are a YouTube video summarizer. Given a transcript, provide a concise and structured summary.

Output format:
## Summary
- A brief overview (2-3 sentences)

## Key Points
- Bullet points of the main topics covered

## Details
- Expanded explanation of each key point with relevant context`,

  insights: `You are an insight extractor. Given a YouTube video transcript, extract actionable insights and key takeaways.

Output format:
## Core Message
- The main thesis or argument of the video (1-2 sentences)

## Key Insights
- Numbered list of distinct insights, each with a brief explanation

## Action Items
- Concrete, actionable steps the viewer can take based on the content

## Quotes
- Notable quotes or statements from the video (if any)`,

  translate: `You are a translator. Translate the given YouTube transcript to the target language while preserving the original meaning and tone. Maintain paragraph structure. Output only the translated text.`,

  memo: `You are a note-taker. Convert the YouTube transcript into a well-organized memo/note format.

Output format:
## Title
- Inferred title from the content

## Date & Source
- YouTube video

## Key Topics
- Topic headers with concise notes under each

## Summary
- 3-5 sentence summary

## Follow-up
- Questions or topics to explore further`,
};

export function getPrompt(action: ActionType, options?: { lang?: string; customPrompt?: string }): string {
  if (action === 'custom') {
    return options?.customPrompt ?? 'Analyze the following transcript:';
  }

  let prompt = PROMPTS[action];

  if (action === 'translate' && options?.lang) {
    prompt += `\n\nTarget language: ${options.lang}`;
  }

  return prompt;
}
