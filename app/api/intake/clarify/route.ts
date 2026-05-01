import { start } from 'workflow/api'
import { clarifyRequestWorkflow } from '@/workflows/clarify-request'
import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { requestId } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select()
    .eq('id', requestId)
    .single()

  if (!request || request.user_id !== user.id) return new Response('Forbidden', { status: 403 })

  const run = await start(clarifyRequestWorkflow, [request.description, request.goal])

  await supabase
    .from('requests')
    .update({ status: 'clarifying' })
    .eq('id', requestId)

  return Response.json({ runId: run.runId, questions: [] })
}
