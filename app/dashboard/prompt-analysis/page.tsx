'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PromptComparison } from '@/components/dashboard/prompt-comparison'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ArchitectureWithPrompts {
  id: string
  request_id: string
  selected_stack_name: string
  prompt_examples: any
  downstream_prompts: any
  confidence_scores: any
  created_at: string
}

export default function PromptAnalysisPage() {
  const [architectures, setArchitectures] = useState<ArchitectureWithPrompts[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchitectures()
  }, [])

  const fetchArchitectures = async () => {
    try {
      const res = await fetch('/api/intake/requests')
      const { data } = await res.json()

      // Get architecture packages for all requests
      if (data && data.length > 0) {
        const archIds = data.map((r: any) => r.id)
        const archRes = await fetch('/api/intake/architect/get?requestIds=' + archIds.join(','))
        const { data: archs } = await archRes.json()
        setArchitectures(archs || [])
      }
    } catch (error) {
      console.error('[v0] Failed to fetch architectures:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageConfidence = (scores: any) => {
    if (!scores) return 0
    return Math.round(scores.overall || 0)
  }

  const countBadExamples = (examples: any) => {
    return (examples?.bad_examples || []).length
  }

  const countGoodExamples = (examples: any) => {
    return (examples?.improved_examples || []).length
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prompt Analysis Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and compare prompt strategies across all your architecture projects
          </p>
        </div>
        <Link
          href="/dashboard/intake"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          New Request
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading prompt analysis...
        </Card>
      ) : architectures.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-muted-foreground">No architecture packages found</p>
          <Link
            href="/dashboard/intake"
            className="text-sm text-primary hover:underline underline-offset-4 inline-block"
          >
            Create one to get started
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {architectures.map((arch) => (
            <Card key={arch.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === arch.id ? null : arch.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-lg">{arch.selected_stack_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {new Date(arch.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{countBadExamples(arch.prompt_examples)}</span> bad examples
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{countGoodExamples(arch.prompt_examples)}</span> good examples
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{calculateAverageConfidence(arch.confidence_scores)}</span>% confidence
                    </div>
                  </div>
                </div>
                {expandedId === arch.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {expandedId === arch.id && (
                <div className="border-t border-border p-6 bg-background/50 space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Prompt Comparison</h4>
                    <PromptComparison
                      badExamples={arch.prompt_examples?.bad_examples || []}
                      improvedExamples={arch.prompt_examples?.improved_examples || []}
                    />
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold text-foreground mb-4">Downstream Prompts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {arch.downstream_prompts &&
                        Object.entries(arch.downstream_prompts).map(([agent, prompt]: [string, any]) => (
                          prompt && (
                            <Card key={agent} className="p-4 border-border bg-card">
                              <h5 className="font-semibold text-foreground text-sm mb-2 capitalize">{agent} Engineer</h5>
                              <code className="text-xs bg-background p-2 rounded block overflow-auto max-h-32 text-foreground">
                                {prompt}
                              </code>
                            </Card>
                          )
                        ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6 flex gap-2">
                    <Link
                      href={`/dashboard/intake?architectureId=${arch.id}`}
                      className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      View Full Architecture
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
