'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobStatusCard } from '@/components/dashboard/job-status-card'
import { AlertCircle, ChevronDown, Loader2, Plus } from 'lucide-react'
import type { Tables } from '@/lib/types'

type Request = Tables<'requests'>
type WorkflowJob = Tables<'workflow_jobs'>

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [jobs, setJobs] = useState<Record<string, WorkflowJob[]>>({})
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/intake/requests')
      if (!res.ok) throw new Error('Failed to fetch requests')
      const { requests: data } = await res.json()
      setRequests(data)

      // Fetch jobs for each request
      for (const req of data) {
        const jobRes = await fetch(`/api/intake/jobs?requestId=${req.id}`)
        if (jobRes.ok) {
          const { jobs: reqJobs } = await jobRes.json()
          setJobs((prev) => ({ ...prev, [req.id]: reqJobs }))
        }
      }
    } catch (err) {
      console.error('[v0] Error fetching requests:', err)
      setError('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async (requestId: string, jobId: string) => {
    try {
      const res = await fetch('/api/intake/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, requestId }),
      })
      if (res.ok) {
        await fetchRequests()
      }
    } catch (err) {
      console.error('[v0] Retry error:', err)
    }
  }

  const handleSkip = async (requestId: string, jobId: string) => {
    try {
      const res = await fetch('/api/intake/jobs/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipJobId: jobId, requestId }),
      })
      if (res.ok) {
        await fetchRequests()
      }
    } catch (err) {
      console.error('[v0] Skip error:', err)
    }
  }

  const handleResume = async (requestId: string, jobId: string) => {
    try {
      const res = await fetch('/api/intake/jobs/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, requestId }),
      })
      if (res.ok) {
        await fetchRequests()
      }
    } catch (err) {
      console.error('[v0] Resume error:', err)
    }
  }

  const statusBadgeColor = {
    draft: 'bg-gray-100 text-gray-800',
    analyzing: 'bg-blue-100 text-blue-800',
    waiting_for_clarification: 'bg-yellow-100 text-yellow-800',
    extracting: 'bg-blue-100 text-blue-800',
    generating_stacks: 'bg-blue-100 text-blue-800',
    generating_architecture: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    resumed: 'bg-orange-100 text-orange-800',
    finalized: 'bg-green-100 text-green-800',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Requests</h1>
          <Button onClick={() => router.push('/dashboard/intake')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {requests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No requests yet. Create one to get started.</p>
            <Button onClick={() => router.push('/dashboard/intake')}>Create Your First Request</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const requestJobs = jobs[request.id] || []
              const failedJobs = requestJobs.filter((j) => j.status === 'failed')
              const isExpanded = expandedRequest === request.id

              return (
                <Card key={request.id} className="overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedRequest(isExpanded ? null : request.id)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{request.title}</h3>
                        <Badge
                          className={statusBadgeColor[request.status as keyof typeof statusBadgeColor]}
                          variant="secondary"
                        >
                          {request.status.replace(/_/g, ' ')}
                        </Badge>
                        {failedJobs.length > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {failedJobs.length} Failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-muted/30">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                          Workflow Jobs
                        </p>
                        {requestJobs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No jobs yet</p>
                        ) : (
                          <div className="space-y-3">
                            {requestJobs.map((job) => (
                              <JobStatusCard
                                key={job.id}
                                job={job}
                                requestId={request.id}
                                onRetry={() =>
                                  handleRetry(request.id, job.id)
                                }
                                onSkip={() =>
                                  handleSkip(request.id, job.id)
                                }
                                onResume={() =>
                                  handleResume(request.id, job.id)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/intake?requestId=${request.id}`)}
                        >
                          Continue
                        </Button>
                        {request.status === 'ready' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/intake?view=export&requestId=${request.id}`)}
                          >
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
