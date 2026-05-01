import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const metricType = searchParams.get('metricType')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let query = supabase.from('analytics').select('*').eq('user_id', user.id)

    if (metricType) {
      query = query.eq('metric_type', metricType)
    }

    const { data: analytics, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { metricType, metricValue, context } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const { data: analytics, error } = await supabase
      .from('analytics')
      .insert({
        user_id: user.id,
        metric_type: metricType,
        metric_value: metricValue,
        period_start: new Date(now.getFullYear(), now.getMonth(), 1),
        period_end: now,
        context,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error creating analytics record:', error)
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 })
  }
}
