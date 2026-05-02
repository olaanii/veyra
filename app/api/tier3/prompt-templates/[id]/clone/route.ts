import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const templateId = params.id

    // Get the source template
    const { data: sourceTemplate, error: fetchError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (fetchError || !sourceTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create a cloned template with new title
    const clonedTitle = `${sourceTemplate.title} (Clone)`
    const { data: clonedTemplate, error: createError } = await supabase
      .from('prompt_templates')
      .insert({
        user_id: user.id,
        title: clonedTitle,
        content: sourceTemplate.content,
        category: sourceTemplate.category,
        tags: sourceTemplate.tags || [],
        is_public: false,
        source_template_id: templateId,
        author_id: user.id,
        usage_count: 0,
      })
      .select()
      .single()

    if (createError) throw createError

    // Increment usage_count on source template
    await supabase
      .from('prompt_templates')
      .update({ usage_count: (sourceTemplate.usage_count || 0) + 1 })
      .eq('id', templateId)

    console.log('[v0] Template cloned:', templateId, '->', clonedTemplate.id)
    return NextResponse.json({ success: true, template: clonedTemplate })
  } catch (error) {
    console.error('[v0] Error cloning template:', error)
    return NextResponse.json({ error: 'Failed to clone template' }, { status: 500 })
  }
}
