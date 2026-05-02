'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PromptTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const CATEGORIES = ['general', 'code', 'analysis', 'writing', 'research', 'testing']

const PROMPT_CHECKLIST = [
  { id: 'specific', label: 'Is the goal specific and measurable?' },
  { id: 'context', label: 'Does it include relevant context?' },
  { id: 'format', label: 'Is the desired output format clear?' },
  { id: 'constraints', label: 'Are constraints or limitations stated?' },
  { id: 'examples', label: 'Are examples or references provided?' },
]

interface Props {
  initialTemplates: PromptTemplate[]
  userId: string
}

export function PromptStudio({ initialTemplates, userId }: Props) {
  const [templates, setTemplates] = useState<PromptTemplate[]>(initialTemplates)
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null)
  const [editor, setEditor] = useState('')
  const [editorTitle, setEditorTitle] = useState('')
  const [editorCategory, setEditorCategory] = useState('general')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  function openTemplate(t: PromptTemplate) {
    setActiveTemplate(t)
    setEditor(t.content)
    setEditorTitle(t.title)
    setEditorCategory(t.category)
    setAnalysis(null)
    setChecklist({})
  }

  function newPrompt() {
    setActiveTemplate(null)
    setEditor('')
    setEditorTitle('')
    setEditorCategory('general')
    setAnalysis(null)
    setChecklist({})
  }

  async function handleSave() {
    if (!editor.trim() || !editorTitle.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (activeTemplate) {
      const { data, error } = await supabase
        .from('prompt_templates')
        .update({ title: editorTitle, content: editor, category: editorCategory })
        .eq('id', activeTemplate.id)
        .select()
        .single()
      if (!error && data) {
        setTemplates(templates.map((t) => (t.id === data.id ? data : t)))
        setActiveTemplate(data)
      }
    } else {
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert({ user_id: userId, title: editorTitle, content: editor, category: editorCategory })
        .select()
        .single()
      if (!error && data) {
        setTemplates([data, ...templates])
        setActiveTemplate(data)
      }
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('prompt_templates').delete().eq('id', id)
    setTemplates(templates.filter((t) => t.id !== id))
    if (activeTemplate?.id === id) newPrompt()
  }

  async function handleAnalyze() {
    if (!editor.trim()) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: editor }),
      })
      const { feedback } = await res.json()
      setAnalysis(feedback)
    } catch {
      setAnalysis('Unable to analyze at this time.')
    }
    setAnalyzing(false)
  }

  const checklistScore = Object.values(checklist).filter(Boolean).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Templates sidebar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Saved prompts</span>
          <Button size="sm" variant="outline" onClick={newPrompt} className="h-7 text-xs px-2">
            + New
          </Button>
        </div>

        {templates.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No saved prompts yet</p>
        )}

        <ul className="space-y-1.5">
          {templates.map((t) => (
            <li
              key={t.id}
              className={cn(
                'group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors',
                activeTemplate?.id === t.id
                  ? 'bg-accent border border-primary/30'
                  : 'hover:bg-secondary border border-transparent',
              )}
              onClick={() => openTemplate(t)}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {t.usage_count} uses</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 ml-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Prompt title"
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={editorCategory}
              onChange={(e) => setEditorCategory(e.target.value)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            placeholder="Write your prompt here...&#10;&#10;Example: You are a senior engineer reviewing code. Given the following function, identify potential bugs, performance issues, and suggest improvements. Format your response as: Issues, Suggestions, Improved Code."
            rows={10}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !editor.trim() || !editorTitle.trim()} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Saving...' : activeTemplate ? 'Save changes' : 'Save prompt'}
            </Button>
            <Button onClick={handleAnalyze} disabled={analyzing || !editor.trim()} variant="outline" size="sm">
              {analyzing ? 'Analyzing...' : 'Analyze prompt'}
            </Button>
          </div>
        </div>

        {/* Quality checklist */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Prompt quality checklist</h3>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              checklistScore >= 4 ? 'bg-emerald-100 text-emerald-700' :
              checklistScore >= 2 ? 'bg-amber-100 text-amber-700' :
              'bg-muted text-muted-foreground'
            )}>
              {checklistScore}/{PROMPT_CHECKLIST.length}
            </span>
          </div>
          <ul className="space-y-2">
            {PROMPT_CHECKLIST.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => setChecklist((c) => ({ ...c, [item.id]: !c[item.id] }))}
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
                    checklist[item.id] ? 'bg-primary border-primary' : 'border-border bg-input',
                  )}
                >
                  {checklist[item.id] && (
                    <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={cn('text-sm', checklist[item.id] ? 'text-muted-foreground line-through' : 'text-foreground')}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI analysis */}
        {analysis && (
          <div className="bg-accent border border-primary/20 rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Logo variant="icon" size={18} href={null} />
              <h3 className="text-sm font-semibold text-foreground">Veyra Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  )
}
