import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'prompts', 'system-prompt.md');
    return readFileSync(promptPath, 'utf-8');
  } catch {
    return `You are BenefitsAI, a helpful assistant that helps people understand their eligibility for public benefits like SNAP and Medicaid. Be empathetic, clear, and always recommend verifying with official sources.`;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = getSystemPrompt();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : 'I apologize, but I was unable to generate a response.';
}
