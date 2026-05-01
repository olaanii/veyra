import { getWritable } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

async function runPromptAnalysis(prompt: string): Promise<string> {
  'use step'

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are Veyra, an expert in prompt engineering for AI agents. Analyze the given prompt and provide structured feedback.

Your analysis must cover:
1. **Clarity** — Is the task clearly defined?
2. **Specificity** — Are inputs, outputs, and constraints explicit?
3. **Context** — Does it provide enough background?
4. **Format** — Is the expected format/structure specified?
5. **Score** — Rate the prompt out of 10 and explain briefly.
6. **Improved Version** — Give a revised prompt that is at least 50% more effective.

Be direct, practical, and educational. Focus on what a junior developer needs to understand.`,
    messages: [{ role: 'user', content: `Analyze this prompt:\n\n${prompt}` }],
  })

  return text
}

async function writeToStream(feedback: string): Promise<void> {
  'use step'

  const writer = getWritable<string>().getWriter()
  try {
    await writer.write(feedback)
  } finally {
    writer.releaseLock()
  }
}

export async function promptAnalyzerWorkflow(prompt: string) {
  'use workflow'

  const feedback = await runPromptAnalysis(prompt)
  await writeToStream(feedback)

  return { feedback }
}
