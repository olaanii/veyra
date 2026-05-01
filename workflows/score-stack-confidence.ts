import { getWritable } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

interface ConfidenceResult {
  confidence_score: number
  reasoning: string
  key_strengths: string[]
  improvement_areas: string[]
}

async function scoreStackConfidence(
  stackTitle: string,
  stackDescription: string,
  pros: string[],
  cons: string[],
  requirements: string[],
): Promise<ConfidenceResult> {
  'use step'

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `Evaluate the confidence score for this tech stack recommendation. Be objective and precise.

Stack: ${stackTitle}
Description: ${stackDescription}
Pros: ${pros.join(', ')}
Cons: ${cons.join(', ')}
Requirements: ${requirements.join(', ')}

Respond with JSON only:
{
  "confidence_score": <0-100>,
  "reasoning": "<brief explanation>",
  "key_strengths": ["<strength1>", "<strength2>"],
  "improvement_areas": ["<area1>", "<area2>"]
}`,
  })

  return JSON.parse(text)
}

export async function scoreStackConfidenceWorkflow(
  stackTitle: string,
  stackDescription: string,
  pros: string[],
  cons: string[],
  requirements: string[],
) {
  'use workflow'

  const result = await scoreStackConfidence(
    stackTitle,
    stackDescription,
    pros,
    cons,
    requirements,
  )

  return result
}
