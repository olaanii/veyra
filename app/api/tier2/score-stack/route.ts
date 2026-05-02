import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const StackConfidenceSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  reasoning: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  estimatedEffort: z.enum(['low', 'medium', 'high']),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendations: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const { stackTitle, stackDescription, pros, cons, requirements, requestId } = await req.json()

    if (!stackTitle || !stackDescription) {
      return NextResponse.json(
        { error: 'stackTitle and stackDescription required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Score stack using Groq
    const { object: result } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: StackConfidenceSchema,
      mode: 'json',
      prompt: `You are a senior software architect. Evaluate this tech stack recommendation and provide a confidence score and analysis.

Stack: "${stackTitle}"
Description: "${stackDescription}"
Pros: ${pros?.join(', ') || 'None provided'}
Cons: ${cons?.join(', ') || 'None provided'}
Requirements: ${requirements?.join(', ') || 'None provided'}

Provide:
- confidenceScore: 0-100 based on how well this stack addresses the requirements
- reasoning: brief explanation of the score
- riskLevel: low/medium/high based on complexity and maturity
- estimatedEffort: low/medium/high for implementation
- strengths: array of key advantages
- concerns: array of potential issues
- recommendations: array of suggestions`,
    })

    if (requestId) {
      // Save snapshot to database
      await supabase.from('stack_snapshots').insert({
        request_id: requestId,
        user_id: user.id,
        snapshot_name: stackTitle,
        snapshot_data: {
          title: stackTitle,
          description: stackDescription,
          pros: pros || [],
          cons: cons || [],
          requirements: requirements || [],
        },
        confidence_score: result.confidenceScore,
        reasoning: result.reasoning,
        is_current: true,
      })
    }

    return NextResponse.json({
      confidenceScore: result.confidenceScore,
      reasoning: result.reasoning,
      riskLevel: result.riskLevel,
      estimatedEffort: result.estimatedEffort,
      strengths: result.strengths,
      concerns: result.concerns,
      recommendations: result.recommendations,
    })
  } catch (error) {
    console.error('Score stack error:', error)
    return NextResponse.json(
      { error: 'Failed to score stack' },
      { status: 500 },
    )
  }
}
