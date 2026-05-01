import { getWritable } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

interface PromptQualityResult {
  quality_score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  token_estimate: number
  efficiency_rating: 'poor' | 'fair' | 'good' | 'excellent'
}

async function scorePromptQuality(
  promptContent: string,
  context: string,
): Promise<PromptQualityResult> {
  'use step'

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `Evaluate the quality of this prompt on a 0-100 scale. Be precise and actionable.

Context: ${context}

Prompt:
${promptContent}

Respond with JSON only (no markdown, just raw JSON):
{
  "quality_score": <0-100>,
  "feedback": "<1-2 sentence summary>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "token_estimate": <estimated tokens>,
  "efficiency_rating": "poor|fair|good|excellent"
}`,
  })

  return JSON.parse(text.trim())
}

export async function scorePromptQualityWorkflow(
  promptContent: string,
  context: string,
) {
  'use workflow'

  const result = await scorePromptQuality(promptContent, context)

  return result
}
