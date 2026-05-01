export type Profile = {
  id: string
  display_name: string | null
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  title: string
  goal: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  score: number | null
  tags: string[]
  created_at: string
}

export type Task = {
  id: string
  user_id: string
  session_id: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  agent_type: string | null
  created_at: string
  updated_at: string
}

export type PromptTemplate = {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  usage_count: number
  created_at: string
}

export type Request = {
  id: string
  user_id: string
  session_id: string | null
  title: string
  description: string
  goal: string | null
  budget: string | null
  timeline: string | null
  team_size: string | null
  scale: string | null
  platform: string | null
  region: string | null
  security_requirements: string | null
  status: 'intake' | 'clarifying' | 'extracted' | 'recommended' | 'finalized'
  created_at: string
  updated_at: string
}

export type ClarifyingQuestion = {
  id: string
  request_id: string
  user_id: string
  question: string
  answer: string | null
  category: string
  created_at: string
}

export type Requirement = {
  id: string
  request_id: string
  user_id: string
  category: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'deferred' | 'removed'
  created_at: string
}

export type StackOption = {
  id: string
  request_id: string
  user_id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  estimated_effort: string | null
  estimated_cost: string | null
  risk_level: 'low' | 'medium' | 'high'
  recommendation_reason: string | null
  rank: number | null
  created_at: string
}

export type Export = {
  id: string
  request_id: string
  user_id: string
  format: 'markdown' | 'json'
  content: string
  created_at: string
}

export type PromptVersion = {
  id: string
  session_id: string
  user_id: string
  content: string
  version_number: number
  quality_score: number | null
  quality_feedback: string | null
  is_good_example: boolean
  confidence_score: number | null
  token_estimate: number | null
  cost_estimate: number | null
  created_at: string
}

export type StackSnapshot = {
  id: string
  request_id: string
  user_id: string
  snapshot_name: string
  snapshot_data: Record<string, any>
  confidence_score: number | null
  reasoning: string | null
  is_current: boolean
  created_at: string
}

export type SessionShare = {
  id: string
  session_id: string
  owner_id: string
  shared_with_email: string
  permission: 'view' | 'comment' | 'edit'
  created_at: string
}

export type SessionComment = {
  id: string
  session_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  created_at: string
  updated_at: string
}

export type Analytics = {
  id: string
  user_id: string
  metric_type: string
  metric_value: number | null
  period_start: string
  period_end: string
  context: Record<string, any> | null
  created_at: string
}
