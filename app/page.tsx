import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">V</span>
          </div>
          <span className="text-foreground font-semibold text-lg">Veyra</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-3xl mx-auto py-24 gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border text-xs text-accent-foreground font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
          Track 1 — WDK Hackathon
        </div>

        <h1 className="text-5xl font-semibold text-foreground tracking-tight leading-tight text-balance">
          Learn to talk to AI agents<br />
          <span className="text-primary">the right way</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed text-balance max-w-xl">
          Veyra is an agent communication workbench for junior developers. Write better prompts, track async tasks, and understand how to decompose goals into agent-ready instructions.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/sign-up"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            Start for free
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground border border-border px-6 py-3 rounded-md hover:border-foreground/30 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <section className="px-8 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '⬡',
              title: 'Prompt Studio',
              desc: 'Iteratively refine your prompts with AI feedback. Score, tag, and save the ones that work.',
            },
            {
              icon: '⬢',
              title: 'Task Board',
              desc: 'Track async agent tasks across kanban columns. Know what\'s running, blocked, or done.',
            },
            {
              icon: '⬡',
              title: 'Architecture Builder',
              desc: 'Decompose your goal into agent-ready steps. Visual flow that teaches prompt decomposition.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-lg p-6 space-y-3"
            >
              <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-primary text-lg">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-5 text-center text-xs text-muted-foreground">
        Built with Vercel WDK · Supabase · Next.js 15
      </footer>
    </main>
  )
}
