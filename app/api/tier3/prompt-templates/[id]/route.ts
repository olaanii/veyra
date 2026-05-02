import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const templateId = params.id
    const { action } = await req.json()

    if (action === 'publish') {
      const { data: template, error: updateError } = await supabase
        .from('prompt_templates')
        .update({ is_public: true, published_at: new Date().toISOString() })
        .eq('id', templateId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('[v0] Template published:', templateId)
      return NextResponse.json({ success: true, template })
    }

    if (action === 'unpublish') {
      const { data: template, error: updateError } = await supabase
        .from('prompt_templates')
        .update({ is_public: false })
        .eq('id', templateId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('[v0] Template unpublished:', templateId)
      return NextResponse.json({ success: true, template })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}
