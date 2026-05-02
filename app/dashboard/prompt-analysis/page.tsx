'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PromptComparison } from '@/components/dashboard/prompt-comparison'
import { ChevronDown, ChevronUp, Clock, Save } from 'lucide-react'

interface ArchitectureWithPrompts {
  id: string
  request_id: string
  selected_stack_name: string
  prompt_examples: any
  downstream_prompts: any
  confidence_scores: any
  created_at: string
}

interface PromptHistoryEntry {
  id: string
  request_id: string | null
  architecture_id: string | null
  prompt_text: string
  analysis_results: any
  bad_examples: any[]
  improved_examples: any[]
  scores: any
  created_at: string
}

export default function PromptAnalysisPage() {
  const [architectures, setArchitectures] = useState<ArchitectureWithPrompts[]>([])
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('architectures')

  useEffect(() => {
    fetchArchitectures()
    fetchPromptHistory()
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

  const fetchPromptHistory = async () => {
    try {
      const res = await fetch('/api/intake/history/save-prompt-analysis')
      const { history } = await res.json()
      setPromptHistory(history || [])
    } catch (error) {
      console.error('[v0] Failed to fetch prompt history:', error)
    }
  }

  const saveToHistory = async (arch: ArchitectureWithPrompts) => {
    setSavingId(arch.id)
    try {
      const res = await fetch('/api/intake/history/save-prompt-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: arch.request_id,
          architectureId: arch.id,
          promptText: arch.selected_stack_name,
          analysisResults: {
            stack: arch.selected_stack_name,
            downstreamPrompts: arch.downstream_prompts,
          },
          badExamples: arch.prompt_examples?.bad_examples || [],
          improvedExamples: arch.prompt_examples?.improved_examples || [],
          scores: arch.confidence_scores,
        }),
      })
      if (res.ok) {
        await fetchPromptHistory()
      }
    } catch (error) {
      console.error('[v0] Failed to save to history:', error)
    } finally {
      setSavingId(null)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Prompt Analysis Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review prompt strategies and track analysis history across your projects
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
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="architectures">
              Architectures ({architectures.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Analysis History ({promptHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architectures" className="space-y-4">
            {architectures.length === 0 ? (
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
              architectures.map((arch) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveToHistory(arch)}
                          disabled={savingId === arch.id}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {savingId === arch.id ? 'Saving...' : 'Save to History'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {promptHistory.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No analysis history yet</p>
                <p className="text-sm text-muted-foreground">
                  Save prompt analyses from the Architectures tab to track your progress
                </p>
              </Card>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-6">
                  {promptHistory.map((entry, index) => (
                    <div key={entry.id} className="relative pl-14">
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                      <Card className="overflow-hidden">
                        <button
                          onClick={() => setExpandedHistoryId(expandedHistoryId === entry.id ? null : entry.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{entry.prompt_text || 'Analysis'}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(entry.created_at)}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>{entry.bad_examples?.length || 0} bad examples</span>
                              <span>{entry.improved_examples?.length || 0} improved</span>
                              <span>{entry.scores?.overall || 0}% confidence</span>
                            </div>
                          </div>
                          {expandedHistoryId === entry.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>

                        {expandedHistoryId === entry.id && (
                          <div className="border-t border-border p-4 bg-background/50 space-y-4">
                            {entry.bad_examples && entry.bad_examples.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-foreground mb-2">Bad Examples</h5>
                                <div className="space-y-2">
                                  {entry.bad_examples.map((ex: any, i: number) => (
                                    <div key={i} className="p-2 bg-red-50 border border-red-100 rounded text-xs">
                                      <p className="text-red-800">{ex.example || ex}</p>
                                      {ex.reason && <p className="text-red-600 mt-1 italic">{ex.reason}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.improved_examples && entry.improved_examples.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-foreground mb-2">Improved Examples</h5>
                                <div className="space-y-2">
                                  {entry.improved_examples.map((ex: any, i: number) => (
                                    <div key={i} className="p-2 bg-green-50 border border-green-100 rounded text-xs">
                                      <p className="text-green-800">{ex.improved || ex}</p>
                                      {ex.explanation && <p className="text-green-600 mt-1 italic">{ex.explanation}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.analysis_results?.downstreamPrompts && (
                              <div>
                                <h5 className="text-sm font-medium text-foreground mb-2">Downstream Prompts</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {Object.entries(entry.analysis_results.downstreamPrompts).map(([agent, prompt]: [string, any]) => (
                                    prompt && (
                                      <div key={agent} className="p-2 bg-muted rounded">
                                        <p className="text-xs font-medium text-foreground capitalize mb-1">{agent}</p>
                                        <code className="text-xs text-muted-foreground line-clamp-2">{prompt}</code>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
