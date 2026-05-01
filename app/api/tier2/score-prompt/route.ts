import { createClient } from '@/lib/supabase/server'
import { execute } from '@vercel/workflow'
import { scorePromptQualityWorkflow } from '@/workflows/score-prompt-quality'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { promptContent, context, sessionId } = await req.json()

    if (!promptContent || !context) {
      return NextResponse.json(
        { error: 'promptContent and context required' },
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
      workflow: scorePromptQualityWorkflow,
      args: [promptContent, context],
    })

    if (sessionId) {
      // Save to prompt_versions
      await supabase.from('prompt_versions').insert({
        session_id: sessionId,
        user_id: user.id,
        content: promptContent,
        version_number: 1,
        quality_score: result.quality_score,
        quality_feedback: result.feedback,
        token_estimate: result.token_estimate,
        confidence_score: null,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error scoring prompt:', error)
    return NextResponse.json(
      { error: 'Failed to score prompt' },
      { status: 500 },
    )
  }
}
