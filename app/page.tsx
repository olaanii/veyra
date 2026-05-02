import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  FileText,
  Target,
  Layers,
  Sparkles,
  GitBranch,
  Workflow,
  ShieldCheck,
  BarChart3,
  Code2,
  MessageSquare,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* ======================= Header ======================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-50/80 border-b border-zinc-200/70">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
            </div>
            <span className="text-zinc-900 font-semibold text-[15px] tracking-tight">
              Veyra
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px] text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Features
            </a>
            <a href="#flow" className="hover:text-zinc-900 transition-colors">
              How it works
            </a>
            <a href="#trusted" className="hover:text-zinc-900 transition-colors">
              Customers
            </a>
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-[14px] text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all shadow-sm hover:shadow"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ======================= Hero ======================= */}
      <section className="relative overflow-hidden">
        {/* subtle grid background */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(228 228 231) 1px, transparent 1px), linear-gradient(to bottom, rgb(228 228 231) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage:
              'radial-gradient(ellipse 60% 50% at 50% 30%, black 40%, transparent 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-7">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
              </span>
              <span className="text-[12px] font-medium text-zinc-700 tracking-tight">
                Built on Vercel WDK · Track 1 Hackathon
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-zinc-900 tracking-[-0.03em] leading-[1.05] text-balance">
              Learn to talk to{' '}
              <span className="text-orange-500 relative">
                AI Agents
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 7 Q 50 2, 100 5 T 198 4"
                    stroke="rgb(249 115 22)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
              <br />
              the right way
            </h1>

            {/* Subtext */}
            <p className="text-[17px] sm:text-lg text-zinc-600 leading-relaxed max-w-2xl text-balance">
              Veyra is the agent communication workbench for engineers. Decompose
              messy goals into structured prompts, score quality in real time, and
              ship reliable agent workflows.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link
                href="/auth/sign-up"
                className="group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-[15px] font-medium px-6 py-3.5 rounded-xl transition-all shadow-[0_8px_24px_-8px_rgba(249,115,22,0.5)] hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.55)] hover:-translate-y-0.5"
              >
                Start for free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#flow"
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-[15px] font-medium px-6 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                See how it works
              </Link>
            </div>

            {/* Tiny trust line */}
            <p className="text-[13px] text-zinc-500 mt-2">
              No credit card required · Free plan available · Setup in 60 seconds
            </p>
          </div>
        </div>
      </section>

      {/* ======================= Architecture Flow ======================= */}
      <section id="flow" className="py-20 lg:py-28 bg-white border-y border-zinc-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[13px] font-medium text-orange-500 uppercase tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight text-balance">
              From client request to agent-ready prompts
            </h2>
            <p className="text-zinc-600 mt-4 text-[15px] leading-relaxed">
              Veyra captures requirements, runs decomposition workflows, and
              produces refined prompts your agents can actually execute.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
              {/* Left: Inputs */}
              <div className="lg:col-span-4 space-y-3">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-4 text-center lg:text-left">
                  Inputs
                </p>
                {[
                  { icon: MessageSquare, label: 'Client request', sub: 'Raw, unstructured brief' },
                  { icon: Target, label: 'Goals & constraints', sub: 'Budget, timeline, scale' },
                  { icon: FileText, label: 'Existing context', sub: 'Code, docs, examples' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-zinc-700" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-zinc-900 truncate">
                        {label}
                      </p>
                      <p className="text-[12px] text-zinc-500 truncate">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Connectors (desktop only) */}
              <div className="hidden lg:block lg:col-span-1 h-full">
                <svg
                  className="w-full h-72"
                  viewBox="0 0 80 280"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 30 C 60 30, 60 140, 80 140"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M0 140 C 60 140, 60 140, 80 140"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M0 250 C 60 250, 60 140, 80 140"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Center: AI Engine */}
              <div className="lg:col-span-2 flex justify-center">
                <div className="relative bg-zinc-900 text-white rounded-2xl p-6 w-full max-w-[200px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                  {/* Glow ring */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-orange-400/40 to-transparent -z-10 blur-md"></div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-semibold tracking-tight">
                        AI Engine
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Powered by WDK
                      </p>
                    </div>
                    <div className="w-full pt-3 mt-1 border-t border-zinc-800 space-y-1.5">
                      {['Decompose', 'Score', 'Refine'].map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-2 text-[11px] text-zinc-300"
                        >
                          <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connectors (desktop only) */}
              <div className="hidden lg:block lg:col-span-1 h-full">
                <svg
                  className="w-full h-72"
                  viewBox="0 0 80 280"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 140 C 20 140, 20 30, 80 30"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M0 140 C 20 140, 20 140, 80 140"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M0 140 C 20 140, 20 250, 80 250"
                    stroke="rgb(249 115 22)"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Right: Outputs */}
              <div className="lg:col-span-4 space-y-3">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 mb-4 text-center lg:text-left">
                  Outputs
                </p>
                {[
                  { icon: Layers, label: 'Architecture plan', sub: 'Stack, modules, flow' },
                  { icon: Code2, label: 'Refined prompts', sub: 'Scored & versioned' },
                  { icon: Workflow, label: 'Agent task graph', sub: 'Ready to execute' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-orange-600" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-zinc-900 truncate">
                        {label}
                      </p>
                      <p className="text-[12px] text-zinc-500 truncate">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= Trusted by ======================= */}
      <section id="trusted" className="py-14 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-[12px] font-semibold tracking-wider uppercase text-zinc-500 mb-8">
            Trusted by engineers building on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-zinc-400">
            {['Vercel', 'Supabase', 'Next.js', 'Groq', 'Workflow DK', 'OpenAI'].map(
              (name) => (
                <span
                  key={name}
                  className="text-[15px] font-semibold tracking-tight hover:text-zinc-600 transition-colors"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ======================= Features ======================= */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[13px] font-medium text-orange-500 uppercase tracking-wider mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight text-balance">
              Everything you need to ship agent workflows
            </h2>
            <p className="text-zinc-600 mt-4 text-[15px] leading-relaxed">
              From intake to deployment, Veyra gives you the structure your team
              needs to communicate with AI agents reliably.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: GitBranch,
                title: 'Prompt Studio',
                desc: 'Iterate, score, and version your prompts. See diffs side-by-side and learn what works.',
              },
              {
                icon: Workflow,
                title: 'Task Board',
                desc: 'Track async agent jobs across kanban columns. Know what is running, blocked, or done.',
              },
              {
                icon: Layers,
                title: 'Architecture Builder',
                desc: 'Decompose any goal into agent-ready steps with confidence scores and reasoning.',
              },
              {
                icon: BarChart3,
                title: 'Quality Analytics',
                desc: 'Monitor prompt quality trends, token costs, and improvement over time.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-zinc-900 text-[16px] tracking-tight">
                  {title}
                </h3>
                <p className="text-[14px] text-zinc-600 mt-2 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CTA Strip ======================= */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-zinc-900 rounded-3xl px-8 py-14 lg:px-16 lg:py-16 relative overflow-hidden">
            {/* Soft accent glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <ShieldCheck
                  className="w-7 h-7 text-orange-400 mb-4"
                  strokeWidth={2}
                />
                <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight text-balance leading-tight">
                  Ready to write better prompts?
                </h2>
                <p className="text-zinc-400 mt-3 text-[15px] leading-relaxed">
                  Join the engineers shipping agent workflows that actually work in
                  production.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-[15px] font-medium px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[15px] font-medium px-6 py-3.5 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= Footer ======================= */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-orange-500" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] text-zinc-700 font-medium">Veyra</span>
            <span className="text-[12px] text-zinc-400">
              Built with Vercel WDK · Supabase · Next.js
            </span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
