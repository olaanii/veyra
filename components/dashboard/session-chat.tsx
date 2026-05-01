'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, Message } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface Props {
  session: Session
  initialMessages: Message[]
  userId: string
}

const PROMPT_TIPS = [
  'Be specific about inputs and expected outputs',
  'State the format you want the result in',
  'Break complex goals into smaller steps',
  'Include relevant context or constraints',
  'Specify the target audience or skill level',
]

export function SessionChat({ session, initialMessages, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % PROMPT_TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userContent = input.trim()
    setInput('')
    setLoading(true)

    const supabase = createClient()

    // Save user message
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ session_id: session.id, user_id: userId, role: 'user', content: userContent })
      .select()
      .single()

    if (userMsg) setMessages((m) => [...m, userMsg])

    // Call AI
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          goal: session.goal,
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: userContent }],
        }),
      })

      const { reply } = await response.json()

      const { data: assistantMsg } = await supabase
        .from('messages')
        .insert({ session_id: session.id, user_id: userId, role: 'assistant', content: reply })
        .select()
        .single()

      if (assistantMsg) setMessages((m) => [...m, assistantMsg])
    } catch {
      const errMsg = 'Unable to reach the assistant. Please try again.'
      const { data: errMsgData } = await supabase
        .from('messages')
        .insert({ session_id: session.id, user_id: userId, role: 'assistant', content: errMsg })
        .select()
        .single()
      if (errMsgData) setMessages((m) => [...m, errMsgData])
    }

    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Prompt tip banner */}
      <div className="border-b border-border bg-accent/50 px-8 py-2 flex items-center gap-2">
        <span className="text-xs text-primary font-medium shrink-0">Tip:</span>
        <span className="text-xs text-muted-foreground transition-all">{PROMPT_TIPS[tipIndex]}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-accent mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Start your session</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Describe your goal clearly. The assistant will help you craft effective agent prompts and break down complex tasks.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">V</span>
              </div>
            )}
            <div
              className={`max-w-lg px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs text-primary font-bold">V</span>
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-8 py-4 shrink-0">
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build or ask... (Shift+Enter for new line)"
            rows={2}
            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground/60 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
