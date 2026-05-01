'use client'

import { PromptVersion } from '@/lib/types'
import { useState } from 'react'

interface PromptComparisonProps {
  versions: PromptVersion[]
}

export function PromptComparison({ versions }: PromptComparisonProps) {
  const [selectedVersions, setSelectedVersions] = useState<[number, number]>([0, 1])

  if (versions.length < 2) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">Need at least 2 versions to compare</p>
      </div>
    )
  }

  const v1 = versions[selectedVersions[0]]
  const v2 = versions[selectedVersions[1]]

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={selectedVersions[0]}
          onChange={(e) => setSelectedVersions([parseInt(e.target.value), selectedVersions[1]])}
          className="px-3 py-2 bg-background border border-border rounded text-sm"
        >
          {versions.map((v, i) => (
            <option key={i} value={i}>
              v{v.version_number} - Quality: {v.quality_score || '—'}%
            </option>
          ))}
        </select>
        <select
          value={selectedVersions[1]}
          onChange={(e) => setSelectedVersions([selectedVersions[0], parseInt(e.target.value)])}
          className="px-3 py-2 bg-background border border-border rounded text-sm"
        >
          {versions.map((v, i) => (
            <option key={i} value={i}>
              v{v.version_number} - Quality: {v.quality_score || '—'}%
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-background rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-2">Version {v1.version_number}</h3>
          <p className="text-xs text-muted-foreground mb-3">{v1.created_at.split('T')[0]}</p>
          <p className="text-sm mb-4 whitespace-pre-wrap">{v1.content}</p>
          <div className="space-y-1 text-xs">
            {v1.quality_score && <p>Quality: {v1.quality_score}%</p>}
            {v1.token_estimate && <p>Tokens: {v1.token_estimate}</p>}
          </div>
        </div>

        <div className="p-4 bg-background rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-2">Version {v2.version_number}</h3>
          <p className="text-xs text-muted-foreground mb-3">{v2.created_at.split('T')[0]}</p>
          <p className="text-sm mb-4 whitespace-pre-wrap">{v2.content}</p>
          <div className="space-y-1 text-xs">
            {v2.quality_score && <p>Quality: {v2.quality_score}%</p>}
            {v2.token_estimate && <p>Tokens: {v2.token_estimate}</p>}
          </div>
        </div>
      </div>

      {v1.quality_score && v2.quality_score && (
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
          <h4 className="text-sm font-semibold mb-2">Improvement</h4>
          <p className="text-sm">
            Quality: {v2.quality_score > v1.quality_score ? '+' : ''}{v2.quality_score - v1.quality_score}%
          </p>
          {v1.token_estimate && v2.token_estimate && (
            <p className="text-sm mt-1">
              Tokens: {v2.token_estimate > v1.token_estimate ? '+' : ''}{v2.token_estimate - v1.token_estimate}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
