import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Token estimation models (approximate)
const TOKEN_COSTS = {
  'gpt-4': 0.03,
  'gpt-3.5-turbo': 0.0005,
  'claude': 0.008,
  'mixtral': 0.0007,
}

const TOKENS_PER_CHAR = 0.25 // Rough estimate

export async function POST(req: NextRequest) {
  try {
    const { requestId, architectureId } = await req.json()

    if (!requestId && !architectureId) {
      return NextResponse.json(
        { error: 'requestId or architectureId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let totalTokens = 0
    const perAgent: Record<string, any> = {}

    if (architectureId) {
      // Estimate from architecture package
      const { data: architecture } = await supabase
        .from('architecture_packages')
        .select('*')
        .eq('id', architectureId)
        .eq('user_id', user.id)
        .single()

      if (architecture) {
        // Count tokens from all sections
        const sections = [
          architecture.requirements_summary,
          JSON.stringify(architecture.architecture_outline),
          JSON.stringify(architecture.agent_tasks),
          JSON.stringify(architecture.downstream_prompts),
          JSON.stringify(architecture.prompt_examples),
          JSON.stringify(architecture.risk_assessment),
        ]

        totalTokens = sections.reduce((sum, section) => {
          const chars = String(section).length
          return sum + Math.ceil(chars * TOKENS_PER_CHAR)
        }, 0)

        // Per-agent estimation
        const agentTasks = architecture.agent_tasks || []
        agentTasks.forEach((task: any) => {
          const taskTokens = (task.estimated_tokens || Math.ceil((task.description?.length || 0) * TOKENS_PER_CHAR))
          perAgent[task.agent] = {
            tokens: taskTokens,
            cost: taskTokens * (TOKEN_COSTS['mixtral'] / 1000),
            hours: task.estimated_hours || 2,
          }
        })
      }
    } else if (requestId) {
      // Estimate from request requirements
      const { data: request } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

      const { data: requirements } = await supabase
        .from('requirements')
        .select('*')
        .eq('request_id', requestId)

      if (request) {
        const reqTokens = Math.ceil(request.brief.length * TOKENS_PER_CHAR)
        totalTokens += reqTokens

        if (requirements) {
          requirements.forEach((req: any) => {
            totalTokens += Math.ceil(req.description.length * TOKENS_PER_CHAR)
          })
        }
      }
    }

    // Calculate cost
    const avgCostPerToken = TOKEN_COSTS['mixtral'] / 1000
    const estimatedCost = totalTokens * avgCostPerToken

    return NextResponse.json({
      totalTokens,
      estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      perAgent,
      breakdown: {
        clarity_clarifying: totalTokens * 0.08,
        extract_requirements: totalTokens * 0.15,
        generate_architecture: totalTokens * 0.35,
        generate_prompts: totalTokens * 0.25,
        risk_analysis: totalTokens * 0.12,
        export: totalTokens * 0.05,
      },
      reasoning: `Estimated ${totalTokens} tokens across workflow with ${Object.keys(perAgent).length} agent roles. Cost calculated at $${avgCostPerToken}/1k tokens.`,
    })
  } catch (error) {
    console.error('[v0] Token estimation error:', error)
    return NextResponse.json(
      { error: 'Failed to estimate tokens' },
      { status: 500 }
    )
  }
}
