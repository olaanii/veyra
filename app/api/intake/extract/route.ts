import { start } from 'workflow/api'
import { extractRequirementsWorkflow } from '@/workflows/extract-requirements'
import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { requestId, answers } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select()
    .eq('id', requestId)
    .single()

  if (!request || request.user_id !== user.id) return new Response('Forbidden', { status: 403 })

  const answerText = Object.entries(answers)
    .map(([q, a]: [string, unknown]) => `${q}: ${a}`)
    .join('\n')

  const run = await start(extractRequirementsWorkflow, [
    request.description,
    answers,
    request.goal,
  ])

  // Save clarifying answers
  for (const [question, answer] of Object.entries(answers)) {
    await supabase.from('clarifying_questions').insert({
      request_id: requestId,
      user_id: user.id,
      question,
      answer: String(answer),
    })
  }

  await supabase
    .from('requests')
    .update({ status: 'extracted' })
    .eq('id', requestId)

  return Response.json({ runId: run.runId })
}
