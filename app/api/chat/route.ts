import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createUIMessageStreamResponse, type UIMessage } from 'ai'
import { start } from 'workflow/api'
import { sessionCoachWorkflow } from '@/workflows/session-coach'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, goal }: { messages: UIMessage[]; goal?: string } = await req.json()

  const run = await start(sessionCoachWorkflow, [messages, goal ?? null])

  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: {
      'x-workflow-run-id': run.runId,
    },
  })
}
