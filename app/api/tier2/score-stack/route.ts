import { createClient } from '@/lib/supabase/server'
import { execute } from '@vercel/workflow'
import { scoreStackConfidenceWorkflow } from '@/workflows/score-stack-confidence'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { stackTitle, stackDescription, pros, cons, requirements } = await req.json()

    if (!stackTitle || !stackDescription) {
      return NextResponse.json(
        { error: 'stackTitle and stackDescription required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Execute workflow for scoring
    const result = await execute({
      workflow: scoreStackConfidenceWorkflow,
      args: [stackTitle, stackDescription, pros || [], cons || [], requirements || []],
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error scoring stack confidence:', error)
    return NextResponse.json(
      { error: 'Failed to score stack' },
      { status: 500 },
    )
  }
}
