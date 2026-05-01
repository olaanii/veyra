import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getWorld } from 'workflow/runtime'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const world = await getWorld()
    const { data: runs } = await world.runs.list({ resolveData: 'none' })

    const serializable = runs.map((r) => ({
      runId: r.runId,
      status: r.status,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt ?? null,
      workflowName: r.workflowName ?? null,
    }))

    return NextResponse.json({ runs: serializable })
  } catch {
    return NextResponse.json({ runs: [] })
  }
}
