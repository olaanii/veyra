'use client'

import { useState } from 'react'

interface PromptScoringPanelProps {
  qualityScore?: number
  qualityFeedback?: string
  tokenEstimate?: number
  efficiencyRating?: 'poor' | 'fair' | 'good' | 'excellent'
  strengths?: string[]
  improvements?: string[]
}

export function PromptScoringPanel({
  qualityScore,
  qualityFeedback,
  tokenEstimate,
  efficiencyRating = 'fair',
  strengths = [],
  improvements = [],
}: PromptScoringPanelProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const ratingColors = {
    poor: 'bg-red-500/10 text-red-700 border-red-200',
    fair: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    good: 'bg-blue-500/10 text-blue-700 border-blue-200',
    excellent: 'bg-green-500/10 text-green-700 border-green-200',
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div>
        <h3 className="text-sm font-semibold mb-3">Prompt Quality Analysis</h3>

        {qualityScore !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Quality Score</span>
              <span className={`text-lg font-bold ${getScoreColor(qualityScore)}`}>{qualityScore}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${qualityScore >= 80 ? 'bg-green-500' : qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${qualityScore}%` }}
              />
            </div>
          </div>
        )}

        {qualityFeedback && (
          <p className="text-xs text-muted-foreground mb-4 p-2 bg-background rounded">{qualityFeedback}</p>
        )}

        {tokenEstimate !== undefined && (
          <div className="text-xs mb-4 p-2 bg-background rounded">
            <span className="text-muted-foreground">Estimated tokens: </span>
            <span className="font-semibold">{tokenEstimate.toLocaleString()}</span>
          </div>
        )}

        {efficiencyRating && (
          <div className={`text-xs p-2 rounded border ${ratingColors[efficiencyRating]} mb-4`}>
            <span className="font-semibold">Efficiency: {efficiencyRating.toUpperCase()}</span>
          </div>
        )}
      </div>

      {strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 text-green-600">Strengths</h4>
          <ul className="text-xs space-y-1 ml-3">
            {strengths.map((s, i) => (
              <li key={i} className="list-disc text-muted-foreground">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 text-amber-600">Areas to Improve</h4>
          <ul className="text-xs space-y-1 ml-3">
            {improvements.map((imp, i) => (
              <li key={i} className="list-disc text-muted-foreground">
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
