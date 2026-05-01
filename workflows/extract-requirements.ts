import { getWritable, fetch } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const RequirementsSchema = z.array(
  z.object({
    category: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
  })
)

async function extractRequirements(
  description: string,
  answers: Record<string, string>,
  goal: string | null,
): Promise<Array<{ category: string; title: string; description: string; priority: string }>> {
  'use step'

  globalThis.fetch = fetch
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const answersText = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n')

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `You are a requirements engineer. Extract concrete functional and non-functional requirements from this project description and answers.

PROJECT DESCRIPTION: "${description}"
${goal ? `GOAL: "${goal}"` : ''}

CLARIFYING ANSWERS:
${answersText}

Extract 8-12 clear, actionable requirements covering:
- Functional features (what the system must do)
- Performance requirements
- Security/compliance
- Scalability
- User experience
- Data management

Return ONLY a JSON array with objects:
{ category: string, title: string, description: string, priority: "low"|"medium"|"high"|"critical" }

Categories: functional, performance, security, scalability, ux, data`,
    temperature: 0.7,
  })

  try {
    return RequirementsSchema.parse(JSON.parse(text))
  } catch {
    return [
      {
        category: 'functional',
        title: 'Core Feature Implementation',
        description: 'Implement primary features based on project goals',
        priority: 'critical',
      },
    ]
  }
}

export async function extractRequirementsWorkflow(
  description: string,
  answers: Record<string, string>,
  goal: string | null,
) {
  'use workflow'

  const writable = getWritable<string>()
  const requirements = await extractRequirements(description, answers, goal)

  for (const req of requirements) {
    const line = `${req.category}|${req.title}|${req.priority}\n`
    const writer = writable.getWriter()
    try {
      await writer.write(line)
    } finally {
      writer.releaseLock()
    }
  }

  return requirements
}
