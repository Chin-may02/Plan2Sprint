# ⚡ PRD → Tasks

AI-powered Product Requirements Document converter. Paste any PRD and get back structured **epics**, **user stories**, **dev tasks** (with estimates), and **QA tasks** — powered by Claude.

## Features

- 🤖 **Claude-powered** breakdown of any PRD format (structured or freeform)
- 🟣 **Epics** → 🔵 **User Stories** → 🟡 **Dev Tasks** (S/M/L/XL estimates) → 🟢 **QA Tasks**
- 📋 Copy as Markdown / Export `.md` file
- 🔐 Optional auth — sign in with email or Google to save history
- 📜 Conversion history dashboard (auth-protected)
- 🚀 Deploys to Vercel in minutes

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                │
│                                                     │
│  app/page.tsx          app/dashboard/page.tsx       │
│  (PRD input + output)  (conversion history)         │
│         │                      │                    │
│         └──────────┬───────────┘                    │
│                    │                                │
│              fetch POST /api/convert                │
└────────────────────┼────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Vercel Serverless (API Route)           │
│                                                     │
│  app/api/convert/route.ts                           │
│  ├── lib/anthropic.ts → Anthropic API (Claude)      │
│  └── lib/supabase/server.ts → Supabase (save)       │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼──────────┐   ┌───────▼──────────────────┐
│  Anthropic API    │   │  Supabase (PostgreSQL)    │
│  claude-sonnet-4  │   │  conversions table (RLS)  │
└───────────────────┘   └──────────────────────────┘
```

---

## Prerequisites

- **Node.js 18+** and npm/yarn/pnpm
- **Supabase CLI** — `npm install -g supabase` (for local dev with Docker)
- **Vercel CLI** — `npm install -g vercel` (for deployment)
- **Docker Desktop** — required for `supabase start`
- An **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)
- A **Supabase project** from [supabase.com](https://supabase.com)

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/prd-to-tasks.git
cd prd-to-tasks
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Get Supabase keys from: **Supabase Dashboard → Project Settings → API**  
> Get Anthropic key from: **[console.anthropic.com](https://console.anthropic.com) → API Keys**

### 3. Start Supabase locally (optional — for full local dev)

```bash
supabase start
# Uses the keys printed in the output for your .env.local
```

### 4. Run the database migration

**Against your Supabase cloud project:**
```bash
supabase db push --linked
```

**Or against local Supabase:**
```bash
supabase db reset
# (this applies all migrations in supabase/migrations/)
```

**Or manually** — paste the contents of `supabase/migrations/001_init.sql` into the **Supabase SQL Editor**.

### 5. Enable Google OAuth (optional)

In Supabase Dashboard → **Authentication → Providers → Google**:
- Enable Google
- Add Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com)
- Add `http://localhost:3000/auth/callback` to Authorized redirect URIs

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add . && git commit -m "init" && git push origin main
```

### 2. Import to Vercel

```bash
vercel
# Follow the prompts to link your GitHub repo
```

Or import via [vercel.com/new](https://vercel.com/new).

### 3. Add environment variables in Vercel Dashboard

Go to **Project → Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-url.vercel.app` |

### 4. Add Vercel URL to Supabase Auth

In Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://your-vercel-url.vercel.app`
- **Redirect URLs**: `https://your-vercel-url.vercel.app/auth/callback`

### 5. Deploy

```bash
vercel --prod
```

---

## Project Structure

```
prd-to-tasks/
├── app/
│   ├── layout.tsx              # Root layout, fonts
│   ├── page.tsx                # Home — PRD input + output
│   ├── globals.css             # Tailwind + custom styles
│   ├── dashboard/
│   │   └── page.tsx            # Auth-protected history
│   ├── api/
│   │   └── convert/
│   │       └── route.ts        # POST — Claude + Supabase
│   └── auth/
│       └── callback/
│           └── route.ts        # OAuth callback
├── components/
│   ├── PrdInput.tsx            # Textarea + submit
│   ├── TaskOutput.tsx          # Epics/stories/tasks cards
│   ├── ConversionHistory.tsx   # Past conversions list
│   ├── LoadingSkeleton.tsx     # Shimmer skeleton
│   └── AuthButton.tsx          # Login/logout modal
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server + service role client
│   └── anthropic.ts            # Claude client + system prompt
├── types/
│   └── index.ts                # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_init.sql        # DB schema + RLS policies
├── middleware.ts                # Protect /dashboard
├── .env.local.example          # Required env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Security Notes

- **`ANTHROPIC_API_KEY`** is only ever used in `app/api/convert/route.ts` (server-side). It never touches the browser.
- **`SUPABASE_SERVICE_ROLE_KEY`** is only used server-side to bypass RLS when inserting conversions on behalf of authenticated users. Never sent to the client.
- **Row Level Security (RLS)** is enabled on the `conversions` table — users can only read/write their own rows.
- Unauthenticated users can still convert PRDs — results are returned but not persisted.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |

---

## License

MIT
