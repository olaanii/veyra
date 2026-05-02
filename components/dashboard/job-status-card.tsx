'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, RotateCcw, SkipForward, Play } from 'lucide-react'
import type { Tables } from '@/lib/types'

interface JobStatusCardProps {
  job: Tables<'workflow_jobs'>
  requestId: string
  onRetry?: () => Promise<void>
  onSkip?: () => Promise<void>
  onResume?: () => Promise<void>
}

export function JobStatusCard({
  job,
  requestId,
  onRetry,
  onSkip,
  onResume,
}: JobStatusCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    setIsLoading(true)
    try {
      await onRetry()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!onSkip) return
    setIsLoading(true)
    try {
      await onSkip()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResume = async () => {
    if (!onResume) return
    setIsLoading(true)
    try {
      await onResume()
    } finally {
      setIsLoading(false)
    }
  }

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    running: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
    retrying: <RotateCcw className="h-4 w-4 text-orange-500 animate-spin" />,
  }

  const statusColor = {
    pending: 'bg-yellow-50 border-yellow-200',
    running: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
    retrying: 'bg-orange-50 border-orange-200',
  }

  const jobTypeLabel = {
    clarify: 'Clarify Requirements',
    extract: 'Extract Requirements',
    architect: 'Generate Architecture',
    regenerate_section: `Regenerate ${job.section_name}`,
  }

  return (
    <Card className={`p-4 border ${statusColor[job.status as keyof typeof statusColor]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {statusIcon[job.status as keyof typeof statusIcon]}
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">
              {jobTypeLabel[job.job_type as keyof typeof jobTypeLabel] || job.job_type}
            </h3>
            <Badge variant="outline" className="mt-1">
              {job.status}
            </Badge>
          </div>
        </div>
      </div>

      {job.error_message && (
        <div className="bg-red-100 border border-red-300 rounded p-2 mb-3">
          <p className="text-xs text-red-800 font-medium mb-1">Error</p>
          <p className="text-xs text-red-700">{job.error_message}</p>
          {job.error_details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-red-600 underline mt-1"
            >
              {showDetails ? 'Hide' : 'Show'} details
            </button>
          )}
          {showDetails && job.error_details && (
            <pre className="text-xs bg-red-50 p-2 mt-2 rounded overflow-auto max-h-32">
              {JSON.stringify(job.error_details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        {job.duration_ms && (
          <span>{(job.duration_ms / 1000).toFixed(2)}s</span>
        )}
        {job.retry_count > 0 && (
          <span>Attempt {job.retry_count + 1}/{job.max_retries + 1}</span>
        )}
        {job.created_at && (
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
        )}
      </div>

      {job.status === 'failed' && (
        <div className="flex gap-2 flex-wrap">
          {job.retry_count < job.max_retries && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="gap-2"
          >
            <SkipForward className="h-3 w-3" />
            Skip Step
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResume}
            disabled={isLoading}
            className="gap-2"
          >
            <Play className="h-3 w-3" />
            Resume
          </Button>
        </div>
      )}

      {job.status === 'retrying' && (
        <p className="text-xs text-orange-700 font-medium">
          Retrying... (Attempt {job.retry_count}/{job.max_retries})
        </p>
      )}
    </Card>
  )
}
