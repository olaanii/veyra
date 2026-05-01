'use client'

import { StackSnapshot } from '@/lib/types'
import { useState } from 'react'

interface ArchitectureHistoryProps {
  snapshots: StackSnapshot[]
  onRestore?: (snapshot: StackSnapshot) => void
}

export function ArchitectureHistory({ snapshots, onRestore }: ArchitectureHistoryProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<StackSnapshot | null>(null)

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-semibold">Architecture History</h3>

      <div className="space-y-2">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            onClick={() => setSelectedSnapshot(snapshot)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              selectedSnapshot?.id === snapshot.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">{snapshot.snapshot_name}</h4>
                <p className="text-xs text-muted-foreground">{snapshot.created_at.split('T')[0]}</p>
              </div>
              <div className="text-right">
                {snapshot.is_current && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-700 rounded">Current</span>
                )}
                {snapshot.confidence_score && (
                  <p className="text-xs font-semibold mt-1">Confidence: {snapshot.confidence_score}%</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSnapshot && (
        <div className="p-3 bg-background rounded-lg border border-border space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground">Details</h4>
            {selectedSnapshot.reasoning && (
              <p className="text-xs mt-2">{selectedSnapshot.reasoning}</p>
            )}
          </div>

          {!selectedSnapshot.is_current && (
            <button
              onClick={() => onRestore?.(selectedSnapshot)}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
            >
              Restore This Version
            </button>
          )}
        </div>
      )}
    </div>
  )
}
