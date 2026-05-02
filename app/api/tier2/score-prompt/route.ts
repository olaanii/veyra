import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const PromptScoreSchema = z.object({
  qualityScore: z.number().min(0).max(100),
  feedback: z.string(),
  tokenEstimate: z.number().positive(),
  efficiency: z.enum(['low', 'medium', 'high']),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const { promptContent, context, sessionId } = await req.json()

    if (!promptContent || !context) {
      return NextResponse.json(
        { error: 'promptContent and context required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Score prompt using Groq
    const { object: result } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: PromptScoreSchema,
      prompt: `You are an expert prompt engineer. Analyze the following prompt and score it on quality (0-100), estimate token usage, and provide constructive feedback.

Prompt: "${promptContent}"
Context: "${context}"

Provide:
- qualityScore: 0-100 based on clarity, specificity, and structure
- feedback: concise explanation of the score
- tokenEstimate: estimated tokens (rough calculation)
- efficiency: low/medium/high based on token usage vs. output quality
- strengths: array of what works well
- improvements: array of suggestions`,
    })

    if (sessionId) {
      // Save version to database
      await supabase.from('prompt_versions').insert({
        session_id: sessionId,
        user_id: user.id,
        content: promptContent,
        version_number: 1,
        quality_score: result.qualityScore,
        quality_feedback: result.feedback,
        token_estimate: result.tokenEstimate,
        confidence_score: Math.min(100, result.qualityScore + 10),
      })
    }

    return NextResponse.json({
      score: result.qualityScore,
      feedback: result.feedback,
      tokenEstimate: result.tokenEstimate,
      efficiency: result.efficiency,
      strengths: result.strengths,
      improvements: result.improvements,
    })
  } catch (error) {
    console.error('Score prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to score prompt' },
      { status: 500 },
    )
  }
}
