import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: versions, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('version_number', { ascending: true })

    if (error) throw error

    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error fetching prompt versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, promptId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get comparison data
    const { data: versions, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('version_number', { ascending: false })
      .limit(2)

    if (error) throw error

    return NextResponse.json({
      comparison: versions,
      improvements: versions.length === 2 ? {
        quality_delta: (versions[0].quality_score || 0) - (versions[1].quality_score || 0),
        token_delta: (versions[0].token_estimate || 0) - (versions[1].token_estimate || 0),
      } : null,
    })
  } catch (error) {
    console.error('Error comparing prompts:', error)
    return NextResponse.json(
      { error: 'Failed to compare prompts' },
      { status: 500 },
    )
  }
}
