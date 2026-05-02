import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get query params for filtering
    const searchParams = req.nextUrl.searchParams
    const includePublic = searchParams.get('includePublic') === 'true'
    const category = searchParams.get('category')
    const tags = searchParams.getAll('tags')

    let query = supabase.from('prompt_templates').select('*')

    // Filter: own templates or public templates
    if (includePublic) {
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`)
    } else {
      query = query.eq('user_id', user.id)
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Filter by tags if provided
    if (tags.length > 0) {
      query = query.contains('tags', tags)
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(templates)
  } catch (error) {
    console.error('[v0] Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, category, tags, isPublic, sourceTemplateId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // If cloning a template, increment usage_count on source
    if (sourceTemplateId) {
      const { data: sourceTemplate } = await supabase
        .from('prompt_templates')
        .select('usage_count')
        .eq('id', sourceTemplateId)
        .single()

      if (sourceTemplate) {
        await supabase
          .from('prompt_templates')
          .update({ usage_count: (sourceTemplate.usage_count || 0) + 1 })
          .eq('id', sourceTemplateId)
      }
    }

    const { data: template, error } = await supabase
      .from('prompt_templates')
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        tags: tags || [],
        is_public: isPublic || false,
        source_template_id: sourceTemplateId || null,
        author_id: user.id,
        usage_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    console.log('[v0] Template created:', template.id)
    return NextResponse.json(template)
  } catch (error) {
    console.error('[v0] Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
