import { DurableAgent } from '@workflow/ai/agent'
import { getWritable } from 'workflow'
import { convertToModelMessages, type UIMessage, type UIMessageChunk } from 'ai'

export async function sessionCoachWorkflow(
  messages: UIMessage[],
  goal: string | null,
) {
  'use workflow'

  const writable = getWritable<UIMessageChunk>()

  const agent = new DurableAgent({
    model: 'openai/gpt-4o-mini',
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
    messages: await convertToModelMessages(messages),
    writable,
    maxSteps: 5,
  })
}
