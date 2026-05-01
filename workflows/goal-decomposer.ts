import { FatalError } from 'workflow'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

interface PipelineStep {
  id: string
  title: string
  description: string
  agent: string
  status: 'pending' | 'active' | 'done'
  inputs: string[]
  outputs: string[]
}

async function decomposGoal(goal: string): Promise<PipelineStep[]> {
  'use step'

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `You are Veyra, an expert AI agent architect. Given a goal, decompose it into 3-6 concrete agent pipeline steps.

Return ONLY a valid JSON array with no markdown fences. Each step must have:
{
  "id": "step-N",
  "title": "Short step name",
  "description": "Clear prompt/instruction for the agent handling this step",
  "agent": "One of: Code Agent, Research Agent, Writer Agent, Analyst Agent, Tester Agent, Orchestrator",
  "status": "pending",
  "inputs": ["list", "of", "inputs"],
  "outputs": ["list", "of", "outputs"]
}

Make the description a concrete, actionable prompt the agent will receive. Ensure outputs of one step feed as inputs to the next.`,
    messages: [{ role: 'user', content: `Decompose this goal into agent pipeline steps:\n\n${goal}` }],
  })

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as PipelineStep[]
  } catch {
    throw new FatalError(`Failed to parse pipeline JSON from model response.`)
  }
}

export async function goalDecomposerWorkflow(goal: string): Promise<{ steps: PipelineStep[] }> {
  'use workflow'

  const steps = await decomposGoal(goal)
  return { steps }
}
