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
