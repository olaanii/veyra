import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await req.json()

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are Veyra, an expert in prompt engineering for AI agents. Analyze the given prompt and provide structured feedback.

Your analysis must cover:
1. **Clarity** — Is the task clearly defined?
2. **Specificity** — Are inputs, outputs, and constraints explicit?
3. **Context** — Does it provide enough background?
4. **Format** — Is the expected format/structure specified?
5. **Improvements** — Give a revised version of the prompt that is 50% more effective.

Be direct, practical, and educational. Focus on what a junior developer needs to understand.`,
      messages: [{ role: 'user', content: `Analyze this prompt:\n\n${prompt}` }],
    })

    return NextResponse.json({ feedback: text })
  } catch {
    return NextResponse.json(
      { feedback: 'Prompt analysis is temporarily unavailable. Please try again.' },
      { status: 200 },
    )
  }
}
