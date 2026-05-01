'use client'

import { Analytics } from '@/lib/types'
import { useEffect, useState } from 'react'

interface AnalyticsDashboardProps {
  metrics?: Analytics[]
}

export function AnalyticsDashboard({ metrics = [] }: AnalyticsDashboardProps) {
  const [qualityTrend, setQualityTrend] = useState(0)
  const [promptCount, setPromptCount] = useState(0)
  const [avgQuality, setAvgQuality] = useState(0)

  useEffect(() => {
    if (metrics.length === 0) return

    const qualityMetrics = metrics.filter((m) => m.metric_type === 'prompt_quality_score')
    if (qualityMetrics.length > 0) {
      const recent = qualityMetrics.slice(-1)[0]?.metric_value || 0
      const previous = qualityMetrics.slice(-2)[0]?.metric_value || 0
      setQualityTrend(recent - previous)
      setAvgQuality(Math.round(qualityMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0) / qualityMetrics.length))
    }

    const promptMetrics = metrics.filter((m) => m.metric_type === 'prompts_created')
    setPromptCount(promptMetrics.reduce((sum, m) => sum + (m.metric_value || 0), 0))
  }, [metrics])

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Avg Quality Score</p>
        <p className="text-2xl font-bold text-foreground">{avgQuality}%</p>
        <p className={`text-xs ${qualityTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {qualityTrend > 0 ? '+' : ''}{qualityTrend}% this month
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Prompts Created</p>
        <p className="text-2xl font-bold text-foreground">{promptCount}</p>
        <p className="text-xs text-muted-foreground">Total this period</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Efficiency</p>
        <div className="text-xl font-bold text-foreground">
          {avgQuality >= 80 ? 'Excellent' : avgQuality >= 60 ? 'Good' : 'Fair'}
        </div>
        <p className="text-xs text-muted-foreground">Based on scores</p>
      </div>
    </div>
  )
}
