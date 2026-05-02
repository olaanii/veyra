'use client'

import { SessionsList } from './sessions-list'
import type { Session } from '@/lib/types'

interface Props {
  initialSessions: Session[]
  userId: string
}

export function AgentCoachingWorkspace({ initialSessions, userId }: Props) {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">About Agent Coaching</h3>
        <p className="text-sm text-blue-800 mb-3">
          Agent Coaching Workspaces let you work with specialized AI agents to refine prompts, test implementation approaches, and improve your architecture before it goes to the team. Each workspace focuses on a specific agent role, so outputs are tailored and actionable.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-800">
          <div>
            <strong>Coach:</strong> General guidance
          </div>
          <div>
            <strong>Code Agent:</strong> Implementation help
          </div>
          <div>
            <strong>Research:</strong> Investigation & analysis
          </div>
          <div>
            <strong>Backend/Frontend:</strong> Architecture
          </div>
          <div>
            <strong>Tester:</strong> QA strategy
          </div>
          <div>
            <strong>Deployment:</strong> DevOps & infrastructure
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <SessionsList initialSessions={initialSessions} userId={userId} />
    </div>
  )
}
