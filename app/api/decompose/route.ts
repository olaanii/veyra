import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { start } from 'workflow/api'
import { goalDecomposerWorkflow } from '@/workflows/goal-decomposer'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal }: { goal: string } = await req.json()
  if (!goal?.trim()) {
    return NextResponse.json({ error: 'goal is required' }, { status: 400 })
  }

  // Start the durable workflow and await its fully-typed return value
  const run = await start(goalDecomposerWorkflow, [goal])
  const result = await run.returnValue

  return NextResponse.json({ steps: result.steps, runId: run.runId })
}
