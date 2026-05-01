import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { start } from 'workflow/api'
import { promptAnalyzerWorkflow } from '@/workflows/prompt-analyzer'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt }: { prompt: string } = await req.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  // Start the durable workflow and await its return value (feedback string)
  const run = await start(promptAnalyzerWorkflow, [prompt])
  const result = await run.returnValue

  return NextResponse.json({ feedback: result.feedback, runId: run.runId })
}
