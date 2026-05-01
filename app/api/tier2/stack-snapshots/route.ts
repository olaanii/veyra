import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: snapshots, error } = await supabase
      .from('stack_snapshots')
      .select('*')
      .eq('request_id', requestId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Error fetching stack snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, snapshotName, snapshotData, confidenceScore } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: snapshot, error } = await supabase
      .from('stack_snapshots')
      .insert({
        request_id: requestId,
        user_id: user.id,
        snapshot_name: snapshotName,
        snapshot_data: snapshotData,
        confidence_score: confidenceScore,
        is_current: true,
      })
      .select()
      .single()

    if (error) throw error

    // Mark previous as non-current
    await supabase
      .from('stack_snapshots')
      .update({ is_current: false })
      .eq('request_id', requestId)
      .eq('user_id', user.id)
      .neq('id', snapshot.id)

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error creating stack snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 },
    )
  }
}
