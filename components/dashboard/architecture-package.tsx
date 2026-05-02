'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react'
import type { Tables } from '@/lib/types'

interface ArchitecturePackageProps {
  architecture: Tables<'architecture_packages'>
}

export function ArchitecturePackage({ architecture }: ArchitecturePackageProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    outline: true,
    tasks: false,
    prompts: false,
    examples: false,
    risks: false,
    estimates: false,
  })
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleRegenerate = async (section: string) => {
    setRegeneratingSection(section)
    try {
      const res = await fetch('/api/intake/architect/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architectureId: architecture.id,
          sections: [section],
        }),
      })

      if (res.ok) {
        // Reload component with updated data
        window.location.reload()
      }
    } catch (error) {
      console.error('[v0] Failed to regenerate:', error)
    } finally {
      setRegeneratingSection(null)
    }
  }

  const outline = architecture.architecture_outline as any
  const tasks = architecture.agent_tasks as any
  const estimates = architecture.estimates as any
  const confidenceScores = architecture.confidence_scores as any
  const promptExamples = architecture.prompt_examples as any
  const riskAssessment = architecture.risk_assessment as any

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Architecture Package</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stack: <span className="font-semibold">{architecture.selected_stack_name}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-foreground">Overall Confidence</div>
          <div className="text-2xl font-bold text-orange-500">
            {Math.round(confidenceScores?.overall || 0)}%
          </div>
        </div>
      </div>

      {/* Requirements Summary */}
      {architecture.requirements_summary && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-2">Requirements Summary</h3>
          <p className="text-sm text-muted-foreground">{architecture.requirements_summary}</p>
        </Card>
      )}

      {/* Architecture Outline */}
      <Card className="bg-card border-border">
        <button
          onClick={() => toggleSection('outline')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Architecture Outline</h3>
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
              {Object.keys(outline || {}).length} components
            </span>
          </div>
          {expandedSections.outline ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.outline && (
          <div className="border-t border-border p-4 space-y-4">
            {Object.entries(outline || {}).map(([component, details]: [string, any]) => (
              <div key={component} className="bg-background/50 rounded p-3">
                <h4 className="font-semibold text-foreground capitalize mb-2">{component}</h4>
                <p className="text-sm text-muted-foreground mb-2">{details.description}</p>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Technologies:</div>
                  <div className="flex flex-wrap gap-2">
                    {(details.key_technologies || []).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate('architecture_outline')}
              disabled={regeneratingSection === 'architecture_outline'}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {regeneratingSection === 'architecture_outline' ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        )}
      </Card>

      {/* Agent Tasks */}
      <Card className="bg-card border-border">
        <button
          onClick={() => toggleSection('tasks')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Agent Tasks</h3>
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
              {tasks?.length || 0} tasks
            </span>
          </div>
          {expandedSections.tasks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.tasks && (
          <div className="border-t border-border p-4 space-y-3">
            {(tasks || []).map((task: any, i: number) => (
              <div key={i} className="bg-background/50 rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground capitalize">{task.agent}</h4>
                    <p className="text-sm text-muted-foreground">{task.title}</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">
                    {task.estimated_hours}h
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate('agent_tasks')}
              disabled={regeneratingSection === 'agent_tasks'}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {regeneratingSection === 'agent_tasks' ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        )}
      </Card>

      {/* Estimates & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-foreground">Estimates</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tokens:</span>
              <span className="font-semibold text-foreground">{estimates?.total_tokens || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Cost:</span>
              <span className="font-semibold text-foreground">${estimates?.estimated_cost || '0'}</span>
            </div>
            {estimates?.reasoning && (
              <p className="text-xs text-muted-foreground italic mt-3">{estimates.reasoning}</p>
            )}
          </div>
        </Card>

        <Card className="bg-card border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Confidence by Component</h3>
          <div className="space-y-2">
            {Object.entries(confidenceScores || {})
              .filter(([key]) => key !== 'overall')
              .map(([component, score]: [string, any]) => (
                <div key={component} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{component}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded">
                      <div
                        className="h-full bg-orange-500 rounded"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                      {Math.round(score)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Risks & Unknowns */}
      <Card className="bg-card border-border">
        <button
          onClick={() => toggleSection('risks')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Risks & Unknowns</h3>
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
              {(riskAssessment?.risks || []).length} identified
            </span>
          </div>
          {expandedSections.risks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.risks && (
          <div className="border-t border-border p-4 space-y-3">
            {(riskAssessment?.risks || []).map((risk: any, i: number) => (
              <div key={i} className="bg-background/50 rounded p-3 border-l-2 border-red-500">
                <p className="font-semibold text-foreground text-sm">{risk.risk}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                    {risk.likelihood}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                    {risk.impact}
                  </span>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate('risk_assessment')}
              disabled={regeneratingSection === 'risk_assessment'}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {regeneratingSection === 'risk_assessment' ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        )}
      </Card>

      {/* Prompt Examples */}
      <Card className="bg-card border-border">
        <button
          onClick={() => toggleSection('examples')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-semibold text-foreground">Prompt Teaching Examples</h3>
          {expandedSections.examples ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.examples && (
          <div className="border-t border-border p-4 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">Bad Examples</h4>
              {(promptExamples?.bad_examples || []).map((ex: any, i: number) => (
                <div key={i} className="bg-red-50 rounded p-2 mb-2 text-xs">
                  <p className="font-semibold text-red-700 mb-1">Issue:</p>
                  <p className="text-red-600">{(ex.issues || [])[0]}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">Improved Examples</h4>
              {(promptExamples?.improved_examples || []).map((ex: any, i: number) => (
                <div key={i} className="bg-emerald-50 rounded p-2 mb-2 text-xs">
                  <p className="font-semibold text-emerald-700 mb-1">Improvement:</p>
                  <p className="text-emerald-600">{(ex.improvements || [])[0]}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate('prompt_examples')}
              disabled={regeneratingSection === 'prompt_examples'}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {regeneratingSection === 'prompt_examples' ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
