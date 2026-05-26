# Resume Roast

A funny-but-useful AI resume reviewer for college students. MVP built with Next.js 14, TypeScript, Tailwind CSS, and the Gemini API.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Then open .env.local and paste your Gemini API key.
# Get one (free tier works fine): https://aistudio.google.com/apikey

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
├─ layout.tsx              # Global shell — wraps every page in Navbar/Footer
├─ page.tsx                # Landing page (hero, how-it-works, FAQ)
├─ globals.css             # Tailwind imports + base styles
├─ roast/page.tsx          # /roast — the main flow
├─ worker/page.tsx         # /worker — JD-tailored resume edits (Pro preview)
├─ cover-letter/page.tsx   # /cover-letter — letter + outreach (Pro preview)
├─ pricing/page.tsx        # /pricing — Free / Pro / International Pro
└─ api/
   ├─ roast/route.ts       # POST /api/roast
   ├─ worker/route.ts      # POST /api/worker
   └─ cover-letter/route.ts# POST /api/cover-letter

components/
├─ Navbar.tsx              # Top nav (sticky)
├─ Footer.tsx              # Footer
├─ Button.tsx              # Shared button with variants
├─ ProBanner.tsx           # "Pro feature coming soon" banner
└─ RoastResult.tsx         # Renders the structured roast JSON

lib/
├─ ai/
│  ├─ provider.ts          # generateAIResponse() — the ONLY place SDKs are imported
│  └─ parseJson.ts         # Defensive JSON parsing for model output
└─ prompts/
   ├─ resumeRoastPrompt.ts
   ├─ resumeWorkerPrompt.ts
   └─ coverLetterPrompt.ts
```

## How the AI abstraction works

Every feature calls `generateAIResponse(prompt, options)` from `lib/ai/provider.ts`. That file is the **only** place where Gemini's SDK is imported. To swap providers later:

1. Add a `callOpenAI()` (or `callAnthropic()`) function in `lib/ai/provider.ts`.
2. Add the case to the `switch` statement.
3. Set `AI_PROVIDER=openai` in `.env.local`.

No other file needs to change. Prompts live in `lib/prompts/` — they're plain functions that build strings, so they work across providers.

## Environment variables

| Variable         | Required | Description                                                   |
| ---------------- | -------- | ------------------------------------------------------------- |
| `AI_PROVIDER`    | no       | `gemini` (default). `openai`/`anthropic` are stubs for later. |
| `GEMINI_API_KEY` | yes      | Get one at https://aistudio.google.com/apikey                 |
| `GEMINI_MODEL`   | no       | Defaults to `gemini-1.5-flash`. Use `gemini-1.5-pro` for higher quality. |

**Important:** these are all server-only. Never prefix with `NEXT_PUBLIC_` — that would leak the key to the browser.

## What's next

- Supabase auth + database for user accounts and saved resumes
- PDF upload (parse to text on the server before sending to AI)
- Stripe payments wiring on `/pricing`
- Rate limiting on the API routes (Upstash Redis is easy here)
- Migrate AI provider to whichever model is best at the time

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, "Import Project" → select the repo.
3. Add the same env vars from `.env.local` to the Vercel project settings.
4. Deploy. Vercel auto-detects Next.js.
