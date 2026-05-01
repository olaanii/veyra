import { DurableAgent } from '@workflow/ai/agent'
import { getWritable, fetch } from 'workflow'
import { createGroq } from '@ai-sdk/groq'
import { type UIMessage, type UIMessageChunk } from 'ai'

export async function sessionCoachWorkflow(
  messages: UIMessage[],
  goal: string | null,
) {
  'use workflow'

  // fetch must be shimmed for the workflow sandbox before using AI SDK
  globalThis.fetch = fetch

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
  const writable = getWritable<UIMessageChunk>()

  const agent = new DurableAgent({
    model: groq('llama-3.3-70b-versatile'),
    instructions: `You are Veyra — an expert agent communication coach helping junior developers learn to write effective prompts for AI agents.

Your job is to:
1. Help users articulate their goals clearly
2. Teach them how to decompose complex tasks into agent-ready steps
3. Suggest prompt improvements and explain WHY a prompt is effective or not
4. Point out common mistakes like vague instructions, missing context, or unclear success criteria
5. Be concise, practical, and educational

${goal ? `The user's session goal: "${goal}"` : ''}

Always end your response with a concrete actionable next step or an improved version of their prompt.`,
  })

  await agent.stream({
    messages,
    writable,
    maxSteps: 5,
  })
}
