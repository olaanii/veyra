'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { WorkflowChatTransport } from '@workflow/ai'
import { createClient } from '@/lib/supabase/client'
import type { Session, Message } from '@/lib/types'
import { Button } from '@/components/ui/button'
import type { UIMessage } from 'ai'

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

function dbMessageToUIMessage(m: Message): UIMessage {
  return {
    id: m.id,
    role: m.role as UIMessage['role'],
    parts: [{ type: 'text', text: m.content }],
    content: m.content,
    createdAt: new Date(m.created_at),
  }
}

export function SessionChat({ session, initialMessages, userId }: Props) {
  const [tipIndex, setTipIndex] = useState(0)
  const [persistedRunId, setPersistedRunId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % PROMPT_TIPS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const transport = useMemo(
    () =>
      new WorkflowChatTransport({
        api: '/api/chat',
        // After each completed response, persist final messages to Supabase
        onChatEnd: async (_, { messages }) => {
          const supabase = createClient()
          // Persist only the latest assistant turn (last message)
          const last = messages[messages.length - 1]
          if (last?.role === 'assistant') {
            const text = last.parts
              .filter((p) => p.type === 'text')
              .map((p) => (p as { type: 'text'; text: string }).text)
              .join('')
            if (text) {
              await supabase
                .from('messages')
                .insert({
                  session_id: session.id,
                  user_id: userId,
                  role: 'assistant',
                  content: text,
                })
            }
          }
        },
        // Capture the run ID from the response header for reconnection
        onChatSendMessage: (_req, res) => {
          const runId = res.headers.get('x-workflow-run-id')
          if (runId) setPersistedRunId(runId)
        },
      }),
    [session.id, userId],
  )

  const { messages, input, handleInputChange, handleSubmit, status, append } = useChat({
    transport,
    initialMessages: initialMessages.map(dbMessageToUIMessage),
    body: {
      goal: session.goal ?? null,
    },
    // Persist user messages to Supabase before they're sent
    onFinish: async () => {
      // assistant turn already persisted in onChatEnd above
    },
  })

  // Persist user messages to Supabase when appended
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input || !input.trim() || status === 'streaming') return
    const supabase = createClient()
    await supabase.from('messages').insert({
      session_id: session.id,
      user_id: userId,
      role: 'user',
      content: input.trim(),
    })
    handleSubmit(e)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isStreaming = status === 'streaming'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tip banner */}
      <div className="border-b border-border bg-accent/50 px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-primary font-medium shrink-0">Tip:</span>
          <span className="text-xs text-muted-foreground truncate">{PROMPT_TIPS[tipIndex]}</span>
        </div>
        {persistedRunId && (
          <span className="text-xs text-muted-foreground/50 shrink-0 font-mono" title="Workflow run ID — stream is durable and resumable">
            run:{persistedRunId.slice(0, 8)}
          </span>
        )}
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
              Describe your goal clearly. Veyra will help you craft effective agent prompts. Responses are backed by durable workflows — they survive refreshes and interruptions.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const text = msg.parts
            .filter((p) => p.type === 'text')
            .map((p) => (p as { type: 'text'; text: string }).text)
            .join('')
          return (
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
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          )
        })}

        {isStreaming && (
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

      {/* Input + Export Actions */}
      <div className="border-t border-border px-8 py-4 shrink-0 space-y-3">
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build or ask... (Shift+Enter for new line)"
            rows={2}
            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>

        {/* Export Actions - Show if there are messages */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                // Export to templates
                const content = messages
                  .filter((m) => m.role === 'assistant')
                  .map((m) => m.content)
                  .join('\n\n')
                console.log('[v0] Export to templates:', content)
              }}
              className="px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              Save to Templates
            </button>
            <button
              type="button"
              onClick={() => {
                // Export to prompt studio
                console.log('[v0] Export to prompt studio')
              }}
              className="px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              Send to Prompt Studio
            </button>
            <button
              type="button"
              onClick={() => {
                // Export to task board
                console.log('[v0] Export to task board')
              }}
              className="px-3 py-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              Create Task
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground/60">
          Enter to send · Shift+Enter for new line · Stream is durable and auto-resumes · Save outputs to Templates or Task Board
        </p>
      </div>
    </div>
  )
}
