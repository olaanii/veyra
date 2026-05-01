import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateText } from 'ai'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal } = await req.json()

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are Veyra, an expert AI agent architect. Given a goal, decompose it into 3-6 concrete agent pipeline steps.

Return ONLY a valid JSON array. Each step must have:
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

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const steps = JSON.parse(cleaned)
    return NextResponse.json({ steps })
  } catch {
    return NextResponse.json({ steps: [] }, { status: 200 })
  }
}
