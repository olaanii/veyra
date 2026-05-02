import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const architectureId = searchParams.get('id')

    if (!architectureId) {
      return NextResponse.json({ error: 'Architecture ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: architecture, error } = await supabase
      .from('architecture_packages')
      .select('*')
      .eq('id', architectureId)
      .eq('user_id', user.id)
      .single()

    if (error || !architecture) {
      return NextResponse.json({ error: 'Architecture package not found' }, { status: 404 })
    }

    return NextResponse.json(architecture)
  } catch (error) {
    console.error('[v0] Get architecture error:', error)
    return NextResponse.json({ error: 'Failed to fetch architecture' }, { status: 500 })
  }
}
