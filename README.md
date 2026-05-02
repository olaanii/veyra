# Veyra

**Architect • Prompt • Build**

Veyra is an AI-powered platform that helps developers design system architectures, craft better prompts, and build applications faster. It combines requirement extraction, architectural analysis, prompt optimization, and team collaboration into a unified workflow.

## 🚀 Features

### Tier 1: Core Workflow
- **Request Intake** - Submit requirements and goals
- **Requirements Extraction** - AI automatically identifies and structures key requirements
- **Architecture Recommendation** - Get AI-powered tech stack suggestions with detailed reasoning
- **Code Export** - Export recommendations as markdown or JSON
- **Session Management** - Save, browse, and manage previous sessions

### Tier 2: Teaching & Refinement
- **Prompt Comparison View** - Side-by-side comparison of prompt iterations with quality deltas
- **Bad vs Good Examples** - Learn from curated examples showing effective vs ineffective prompts
- **Confidence Scores** - See confidence ratings (0-100%) on architecture recommendations
- **Prompt Quality Scoring** - Automatic scoring of prompts with feedback on strengths and improvements
- **Token/Cost Estimator** - Estimate token usage and API costs for prompts

### Tier 3: Team & Analytics
- **Template Library** - Save and reuse prompt templates with tagging and search
- **Architecture History** - Track all stack snapshots with full rollback support
- **Team Collaboration** - Share sessions with team members and assign permission levels (view/comment/edit)
- **Session Comments** - Threaded discussions and feedback on shared sessions
- **Analytics Dashboard** - Track quality trends, prompt improvements, and efficiency metrics over time

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui components, Radix UI primitives
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **AI/ML**: 
  - Groq for fast inference (scoring workflows)
  - AI SDK 6 for chat and generation
  - @workflow/ai for durable workflows
- **Database**: Supabase with Row Level Security (RLS)
- **Analytics**: Recharts, SWR for data fetching
- **Styling**: Light theme (zinc + orange accent), semantic design tokens

## 📦 Project Structure

```
/app
  /dashboard          # Protected dashboard routes
    /page.tsx         # Dashboard home
    /requests         # Request management
    /sessions         # Session browser
    /templates        # Prompt template library
    /analytics        # Analytics dashboard
    /layout.tsx       # Dashboard layout with sidebar
  /auth               # Authentication pages (login/signup)
  /api
    /chat             # Chat endpoint
    /requests         # Request API
    /sessions         # Session API
    /tier2            # Scoring and comparison APIs
    /tier3            # Collaboration and template APIs
  /workflows          # Durable workflows for scoring
  page.tsx            # Landing page
  layout.tsx          # Root layout
  globals.css         # Design tokens & global styles

/components
  /dashboard          # Dashboard-specific components
  /tier2              # Teaching & refinement components
  /tier3              # Team & analytics components
  /ui                 # Reusable UI components (shadcn/ui)
  logo.tsx            # Veyra brand logo

/lib
  /supabase           # Supabase client & utilities
  types.ts            # TypeScript type definitions
  utils.ts            # Helper utilities
```

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts (via Supabase Auth)
- `requests` - Architecture requests
- `stack_options` - Architecture recommendations
- `sessions` - Chat/conversation sessions
- `prompt_templates` - Reusable prompt templates

**Tier 2 Tables:**
- `prompt_versions` - Track prompt iterations with quality scores
- `stack_snapshots` - Architecture snapshots with confidence ratings

**Tier 3 Tables:**
- `session_shares` - Team collaboration and permissions
- `session_comments` - Threaded feedback and discussions
- `analytics` - User metrics and quality trends

All tables have Row Level Security (RLS) policies enforcing user isolation.

## 🔄 Workflows

**Durable Workflows** (using @workflow/ai):
- `score-prompt-quality.ts` - Groq AI scores prompts with detailed feedback
- `score-stack-confidence.ts` - Groq AI rates architecture confidence with reasoning

## 🎨 Design System

- **Colors**: Light theme with zinc neutrals and orange primary (#FF6B35)
- **Typography**: 2 font families (Geist sans, Geist Mono)
- **Layout**: Flexbox-first, responsive mobile-to-desktop
- **Icons**: Lucide React icons throughout
- **Theming**: Semantic design tokens (background, card, primary, etc.)

## 🔐 Authentication

- **Provider**: Supabase Auth
- **Session**: HTTP-only cookies
- **Protected Routes**: Dashboard requires authenticated session
- **Public Routes**: Landing page, auth pages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Veyra uses Next.js 16)
- Supabase project (database + auth)
- Groq API key (for scoring workflows)

### Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd veyra
   npm install
   ```

2. **Environment variables**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GROQ_API_KEY=your_groq_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Database setup**
   - Create Supabase project
   - Run migrations (schema is applied automatically)
   - Enable RLS on all tables

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📖 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signout` - Sign out

### Chat & Requests
- `POST /api/chat` - Stream chat messages
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session details

### Tier 2 (Scoring)
- `POST /api/tier2/score-prompt` - Score and save prompt versions
- `POST /api/tier2/score-stack` - Score stack confidence
- `GET /api/tier2/prompt-versions` - Compare prompt iterations
- `GET /api/tier2/stack-snapshots` - Get architecture history

### Tier 3 (Collaboration)
- `POST /api/tier3/share-session` - Share session with team members
- `POST /api/tier3/session-comments` - Add comments/feedback
- `GET /api/tier3/prompt-templates` - Search template library
- `POST /api/tier3/analytics` - Track metrics

## 🧪 Testing

Run tests:
```bash
npm run test
```

Run linter:
```bash
npm run lint
```

## 🚢 Deployment

The project is configured for **Vercel** deployment:

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel settings
3. Merge to `main` branch to auto-deploy
4. Vercel Analytics enabled for monitoring

Production URL: [veyra.vercel.app](https://veyra.vercel.app)

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [AI SDK Docs](https://sdk.vercel.ai)
- [v0 Docs](https://v0.app/docs)

## 👥 Team

Built by **Olani** @ 2026

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Site**: [veyra.vercel.app](https://veyra.vercel.app)
- **GitHub**: [olaanii/veyra](https://github.com/olaanii/veyra)
- **v0 Project**: [Continue on v0](https://v0.app/chat/projects/prj_lWTrqJVO2us5mHFrKU5x9Ypl0UEr)

---

**Veyra** — The complete workflow for architecting, prompting, and building with AI.
