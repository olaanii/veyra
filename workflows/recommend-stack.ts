import { getWritable, fetch } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const StackSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    estimated_effort: z.string(),
    estimated_cost: z.string(),
    risk_level: z.enum(['low', 'medium', 'high']),
    recommendation_reason: z.string(),
  })
)

async function recommendStack(
  description: string,
  requirements: string,
  answers: Record<string, string>,
  goal: string | null,
): Promise<
  Array<{
    title: string
    description: string
    pros: string[]
    cons: string[]
    estimated_effort: string
    estimated_cost: string
    risk_level: string
    recommendation_reason: string
  }>
> {
  'use step'

  globalThis.fetch = fetch
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const answersText = Object.entries(answers)
    .map(([q, a]) => `${q}: ${a}`)
    .join('\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `You are a technology architect. Recommend 3 different technology stacks for this project.

PROJECT DESCRIPTION: "${description}"
${goal ? `GOAL: "${goal}"` : ''}

CONSTRAINTS:
${answersText}

REQUIREMENTS: ${requirements}

Recommend 3 tech stacks with different trade-offs (e.g., "Fast & Modern", "Enterprise & Stable", "Cost-Effective"). For each:
- Stack name
- Brief description
- 4-5 pros
- 4-5 cons
- Estimated dev effort (weeks)
- Estimated hosting cost (/month)
- Risk level
- Why recommend it

Return ONLY valid JSON array:
[{ title: string, description: string, pros: string[], cons: string[], estimated_effort: string, estimated_cost: string, risk_level: "low"|"medium"|"high", recommendation_reason: string }]`,
    temperature: 0.7,
  })

  try {
    return StackSchema.parse(JSON.parse(text))
  } catch {
    return [
      {
        title: 'Modern SaaS Stack',
        description: 'Next.js + TypeScript + Supabase',
        pros: ['Fast development', 'Scalable', 'Modern tooling', 'Great DX'],
        cons: ['Requires Node.js knowledge', 'PostgreSQL learning curve'],
        estimated_effort: '6-8 weeks',
        estimated_cost: '$50-200/month',
        risk_level: 'low',
        recommendation_reason: 'Best for rapid development with modern best practices',
      },
    ]
  }
}

export async function recommendStackWorkflow(
  description: string,
  requirements: string,
  answers: Record<string, string>,
  goal: string | null,
) {
  'use workflow'

  const writable = getWritable<string>()
  const stacks = await recommendStack(description, requirements, answers, goal)

  for (const stack of stacks) {
    const line = `${stack.title}|${stack.risk_level}\n`
    const writer = writable.getWriter()
    try {
      await writer.write(line)
    } finally {
      writer.releaseLock()
    }
  }

  return stacks
}
