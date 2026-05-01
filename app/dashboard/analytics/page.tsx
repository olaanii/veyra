'use client'

import { AnalyticsDashboard } from '@/components/tier3/analytics-dashboard'
import { Analytics } from '@/lib/types'
import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/tier3/analytics')
        if (res.ok) {
          setAnalytics(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your prompt quality improvements over time</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      ) : (
        <div className="space-y-6">
          <AnalyticsDashboard metrics={analytics} />

          <div className="p-4 bg-card rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4">Monthly Metrics</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Quality Score: Measure of prompt effectiveness (0-100%)</p>
              <p>Tokens Used: Efficiency metric for prompt length</p>
              <p>Confidence: AI assessment of architecture recommendations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
