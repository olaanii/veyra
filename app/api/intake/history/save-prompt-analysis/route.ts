import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      requestId,
      architectureId,
      promptText,
      analysisResults,
      badExamples,
      improvedExamples,
      scores,
    } = await req.json()

    // Save to prompt_history table
    const { data: history, error } = await supabase
      .from('prompt_history')
      .insert({
        user_id: user.id,
        request_id: requestId || null,
        architecture_id: architectureId || null,
        prompt_text: promptText,
        analysis_results: analysisResults || {},
        bad_examples: badExamples || [],
        improved_examples: improvedExamples || [],
        scores: scores || {},
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error saving prompt history:', error)
      return NextResponse.json({ error: 'Failed to save prompt history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, history })
  } catch (error) {
    console.error('[v0] Save prompt history error:', error)
    return NextResponse.json({ error: 'Failed to save prompt history' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const requestId = searchParams.get('requestId')
    const architectureId = searchParams.get('architectureId')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (requestId) {
      query = query.eq('request_id', requestId)
    }

    if (architectureId) {
      query = query.eq('architecture_id', architectureId)
    }

    const { data: history, error } = await query

    if (error) {
      console.error('[v0] Error fetching prompt history:', error)
      return NextResponse.json({ error: 'Failed to fetch prompt history' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('[v0] Fetch prompt history error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompt history' }, { status: 500 })
  }
}
