# Veyra - WDK Track 1: Architecture & Prompt Intelligence

**Architect • Extract • Refine • Build**

Veyra is an AI-powered architecture design and prompt intelligence platform built with Vercel Workflows Development Kit (WDK) Track 1. It helps teams go from requirements to production-ready architecture with automated requirements extraction, AI-powered architecture packages, and teaching-first prompt strategies.

## 🎯 What is This?

Veyra is the **complete workflow for intelligent architecture design**:
1. **Submit** project brief → **Get clarifying questions** → **Answer them** 
2. **AI extracts** structured requirements from your responses
3. **Generate** technology stacks with reasoning and tradeoffs
4. **Build architecture package** with: outline (5 components), agent tasks, downstream prompts per agent, token/cost estimates, risk assessment, confidence scores
5. **Export** full PRD with architecture, prompts, examples, and deployment guide
6. **Materialize** tasks to your kanban board for team implementation
7. **Track** full async workflow with retry/resume for any failed step

## 🏗️ 6 Milestones Delivered

### Milestone 1: Architecture Recommendation (COMPLETE)
- Request intake flow with brief capture
- Stack recommendation with tradeoffs, pros/cons
- Export as markdown/JSON with full reasoning

### Milestone 2: Clarifying Questions & Requirements (COMPLETE)
- AI generates 5-7 context-specific clarifying questions
- Structured requirements extraction from Q&A
- Persistent storage with status tracking

### Milestone 3: Architecture Package Workflow (COMPLETE)
- Orchestrated 8-output architecture generation:
  - Requirements summary → Architecture outline (5 components) 
  - Agent task breakdown → Downstream prompts (6 agent types)
  - Token/cost estimates → Risk assessment → Confidence scoring
- JSONB storage for nested structures
- Independent section regeneration (any part can be re-run)

### Milestone 4: Async Resumability (COMPLETE)
- `workflow_jobs` table tracks every async operation
- Job status polling endpoints
- Retry (up to 3x), skip, resume actions for failed jobs
- Request status progression with full timeline
- Error details and recovery options surfaced in UI

### Milestone 5: Teaching & Demo Polish (COMPLETE)
- PromptComparison component: bad vs improved prompts side-by-side
- Dashboard redesigned to emphasize Requests over sessions
- Prompt Strategy section in exports with effectiveness scores
- Prompt Analysis page listing all architectures with metrics
- Enhanced markdown with tables, admonitions, and copy-paste prompts

### Milestone 6: Polish & Completeness (COMPLETE)
- Task materialization: agent tasks auto-create in kanban board
- Token/cost estimator endpoint with per-agent breakdown
- Request status model: 11 granular statuses with timeline tracking
- README updated with full API docs and deployment guide
- Task board polished with architecture links and subtask support

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Groq (inference)
- **Database**: Supabase PostgreSQL with RLS
- **AI**: AI SDK 6 with Groq provider
- **Async**: Supabase polling, job tracking

## 📂 Project Structure

```
/app
  /dashboard
    /page.tsx                # Overview with Recent Requests
    /requests/page.tsx       # Request list with live polling
    /intake/page.tsx         # 6-stage intake flow
    /tasks/page.tsx          # Kanban board (auto-materialized)
    /prompt-analysis/page.tsx # Prompt metrics dashboard
  /api
    /intake/
      /clarify/route.ts      # Generate clarifying questions
      /extract/route.ts      # Extract requirements from Q&A
      /recommend-stack/route.ts
      /architect/route.ts    # 12-subtask orchestration
      /architect/regenerate/route.ts
      /architect/get/route.ts
      /materialize-tasks/route.ts
      /estimate-tokens/route.ts
      /export/route.ts       # Full PRD export
    /intake/jobs/
      /route.ts              # Job polling & creation
      /retry/route.ts        # Retry failed jobs
      /skip/route.ts         # Skip & move to ready
      /resume/route.ts       # Resume for manual recovery
    /intake/requests/route.ts

/components/dashboard
  /request-intake-form.tsx
  /clarifying-qa.tsx
  /requirements-display.tsx
  /stack-recommendation.tsx
  /architecture-package.tsx
  /prompt-comparison.tsx     # Side-by-side bad/good
  /job-status-card.tsx       # Job tracking UI
  /request-list.tsx
  /request-progress.tsx

/lib
  /types.ts                  # Full TypeScript schema
  /supabase/server.ts
  /supabase/client.ts
```

## 🗄️ Database Schema

**Core Tables:**
- `requests` - Architecture requests with 11-status progression + timeline
- `clarifying_questions` - Generated Q&A for scope clarification
- `requirements` - Extracted structured requirements
- `architecture_packages` - Full architecture outputs (8 JSONB fields)
- `workflow_jobs` - Track every async operation (clarify, extract, architect, regenerate)
- `tasks` - Kanban board (auto-materialized from agent_tasks)
- `exports` - Generated PRDs (markdown/JSON)

**Key Fields:**
- `requests.status_timeline` - Full progression: draft → analyzing → waiting_for_clarification → extracting → generating_stacks → generating_architecture → ready → finalized
- `workflow_jobs.status` - pending | running | completed | failed | retrying
- `architecture_packages.agent_tasks` - 6+ tasks per agent (frontend, backend, db, infra, testing, deployment)
- `architecture_packages.prompt_examples` - bad/good examples with scores

## 🔄 API Endpoints

### Intake Workflow
- `POST /api/intake` - Create request
- `GET /api/intake/requests` - List all requests
- `POST /api/intake/clarify` - Generate clarifying questions
- `POST /api/intake/extract` - Extract requirements from Q&A
- `POST /api/intake/recommend-stack` - Get tech stacks
- `POST /api/intake/architect` - Generate full architecture package
- `POST /api/intake/architect/regenerate` - Regenerate section
- `GET /api/intake/architect?id=...` - Fetch specific package
- `POST /api/intake/materialize-tasks` - Auto-create kanban tasks
- `POST /api/intake/estimate-tokens` - Token/cost breakdown
- `POST /api/intake/export` - Export PRD

### Job Management
- `GET /api/intake/jobs?requestId=...` - Poll job status
- `POST /api/intake/jobs` - Create new job
- `POST /api/intake/jobs/retry` - Retry failed job
- `POST /api/intake/jobs/skip` - Skip step
- `POST /api/intake/jobs/resume` - Resume request

## 🎯 Key Features

### Requirements to Architecture in One Flow
Submit brief → Answer AI questions → Get extracted requirements → Pick tech stack → Generate architecture package with all agent prompts, tasks, estimates, and risks

### Intelligent Regeneration
Re-run any section independently: just requirements summary, just prompts, just risk assessment, just confidence scores — full lineage preserved

### Teaching-First Prompts
Every architecture package includes bad vs improved prompt examples showing *why* effective prompts work better. Scored for effectiveness.

### Full Async Observability
Every step (clarify, extract, architect, regenerate) is tracked as a workflow job. Failed steps show errors with retry/skip/resume options. Full timeline on requests.

### Copy-Paste Ready Exports
PRD exports include:
- Requirements table
- Architecture outline per component
- Agent task breakdown with subtasks
- Downstream prompt per agent (ready to paste to team)
- Risk assessment with mitigations
- Token/cost estimates with reasoning
- Bad vs improved prompt examples

### Auto-Materialized Tasks
Agent tasks automatically create kanban cards with architecture source link, subtasks, and downstream prompt button.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project
- Groq API key

### Setup

```bash
# Install
npm install

# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...

# Run
npm run dev
# Open http://localhost:3000
```

## 📊 Usage Flow

1. **Dashboard** → Click "New Request"
2. **Submit Brief** → E.g. "E-commerce platform with real-time inventory"
3. **Get Questions** → AI asks about scale, integrations, timeline
4. **Answer Q&A** → Provide context
5. **Extract Requirements** → AI structures them
6. **Pick Stack** → Choose recommended architecture
7. **Generate Architecture** → Full package with all 8 outputs
8. **Review Prompts** → See bad vs improved examples
9. **Export PRD** → Share with team
10. **View Tasks** → Kanban board auto-populated with agent tasks
11. **Track Progress** → Request list shows live status with job timeline

## 🔍 Deployment

Configured for **Vercel**:
```bash
git push origin main
# Auto-deploys to Vercel
```

Environment variables in Vercel dashboard Settings → Environment Variables.

## 📚 Key Docs

- [Next.js 16](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Groq API](https://console.groq.com/docs)
- [AI SDK 6](https://sdk.vercel.ai)

## 📝 License

MIT

---

**Veyra** — From brief to architecture to prompts. Built with Vercel WDK Track 1.
