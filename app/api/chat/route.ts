import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, goal } = await req.json()

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are Veyra — an expert agent communication coach helping junior developers learn to write effective prompts for AI agents.

Your job is to:
1. Help users articulate their goals clearly
2. Teach them how to decompose complex tasks into agent-ready steps  
3. Suggest prompt improvements and explain WHY a prompt is effective or not
4. Point out common mistakes like vague instructions, missing context, or unclear success criteria
5. Be concise, practical, and educational

${goal ? `The user's session goal: "${goal}"` : ''}

Always end your response with a concrete actionable next step or an improved version of their prompt.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    return NextResponse.json({ reply: text })
  } catch {
    return NextResponse.json(
      { reply: 'The AI service is temporarily unavailable. Please check your API configuration and try again.' },
      { status: 200 },
    )
  }
}
