import { getWritable, fetch } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const ClarifyingQuestionsSchema = z.array(
  z.object({
    category: z.string(),
    question: z.string(),
  })
)

async function generateClarifyingQuestions(
  description: string,
  goal: string | null,
): Promise<Array<{ category: string; question: string }>> {
  'use step'

  globalThis.fetch = fetch
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `You are a product discovery expert helping developers turn vague project ideas into clear requirements.

Given this project description: "${description}"
${goal ? `Project goal: "${goal}"` : ''}

Generate 5-7 clarifying questions that would help you understand:
- Project scope and scale
- Technical constraints
- Team composition
- Budget and timeline
- Target users/platform
- Security/compliance needs

Return a JSON array with objects: { category: string, question: string }

Categories: scope, technical, team, timeline, users, security

Respond ONLY with valid JSON array, no markdown.`,
    temperature: 0.7,
  })

  try {
    return ClarifyingQuestionsSchema.parse(JSON.parse(text))
  } catch {
    return [
      { category: 'scope', question: 'What is the primary goal of this project?' },
      { category: 'technical', question: 'What are the main technical constraints?' },
      { category: 'team', question: 'How large is your team?' },
      { category: 'timeline', question: 'What is your target launch timeline?' },
      { category: 'users', question: 'Who are your target users?' },
    ]
  }
}

export async function clarifyRequestWorkflow(description: string, goal: string | null) {
  'use workflow'

  const writable = getWritable<string>()
  const questions = await generateClarifyingQuestions(description, goal)

  for (const q of questions) {
    const line = `${q.category}|${q.question}\n`
    const writer = writable.getWriter()
    try {
      await writer.write(line)
    } finally {
      writer.releaseLock()
    }
  }

  return questions
}
