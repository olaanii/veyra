import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const StackRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      stackName: z.string().describe('Name of the recommended tech stack'),
      description: z.string().describe('Brief description of why this stack fits'),
      technologies: z.object({
        frontend: z.array(z.string()),
        backend: z.array(z.string()),
        database: z.array(z.string()),
        infrastructure: z.array(z.string()),
        devops: z.array(z.string()),
      }),
      reasoning: z.string().describe('Detailed reasoning for this recommendation'),
      confidenceScore: z.number().min(0).max(100),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      effortEstimate: z.enum(['low', 'medium', 'high']),
      riskLevel: z.enum(['low', 'medium', 'high']),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (requestError || !request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Get extracted requirements for context
    const { data: requirements } = await supabase
      .from('requirements')
      .select('*')
      .eq('request_id', requestId)

    // Build requirements context
    const requirementsContext = requirements
      ?.map(r => `[${r.type.toUpperCase()}] ${r.title} (Priority: ${r.priority})\n${r.description}`)
      .join('\n\n') || ''

    // Generate stack recommendations using Groq
    const { object: result } = await generateObject({
      model: groq('mixtral-8x7b-32768'),
      schema: StackRecommendationSchema,
      prompt: `Based on the following project requirements, generate 3-5 optimized technology stack recommendations.

PROJECT BRIEF:
"${request.brief}"

EXTRACTED REQUIREMENTS:
${requirementsContext}

For each stack recommendation, provide:
1. A clear, memorable stack name (e.g., "Modern React + Node.js Stack")
2. Specific technologies for frontend, backend, database, infrastructure, and DevOps
3. Detailed reasoning explaining why this stack fits these requirements
4. Confidence score (0-100) indicating how well this stack addresses the requirements
5. 3-5 key pros and cons for each stack
6. Effort estimate (low/medium/high) to implement
7. Risk level (low/medium/high) assessment

Consider factors like: scalability, performance, developer experience, cost, learning curve, community support, and long-term maintainability.`,
    })

    // Store the recommendations
    const { data: recommendations, error: insertError } = await supabase
      .from('stack_recommendations')
      .insert(
        result.recommendations.map((r) => ({
          request_id: requestId,
          user_id: user.id,
          stack_name: r.stackName,
          description: r.description,
          technologies: r.technologies,
          reasoning: r.reasoning,
          confidence_score: r.confidenceScore,
          pros: r.pros,
          cons: r.cons,
          effort_estimate: r.effortEstimate,
          risk_level: r.riskLevel,
        }))
      )
      .select()

    if (insertError) {
      console.error('[v0] Failed to insert stack recommendations:', insertError)
      return NextResponse.json(
        { error: 'Failed to store recommendations' },
        { status: 500 }
      )
    }

    // Update request status
    await supabase
      .from('requests')
      .update({ status: 'recommending' })
      .eq('id', requestId)

    return NextResponse.json({
      requestId,
      recommendations: recommendations || result.recommendations,
      message: 'Stack recommendations generated successfully',
    })
  } catch (error) {
    console.error('[v0] Recommend-stack endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to generate stack recommendations' },
      { status: 500 }
    )
  }
}
