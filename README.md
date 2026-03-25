# RealEstate | Luxury Brokerage

## Overview
Premium real-estate listing platform with:
- Public property browsing (filters + property details)
- Admin console for agents, listings, inquiries, and review approvals
- AI assistant chat powered by a Supabase Edge Function (Groq/OpenAI)

## Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + shadcn-ui (shadcn/ui components)
- Backend: Supabase (Auth, Postgres, RLS, Storage)
- AI: Supabase Edge Functions (Deno) + Groq/OpenAI
- Hosting: Vercel (SPA rewrite enabled)

## Local Development
1. Install dependencies: `npm i`
2. Create `.env.local` (copy from your existing template) with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_ADMIN_EMAILS` (comma-separated; used to bootstrap admin UI access)
3. Run: `npm run dev`

Build check:
- `npm run build`

## Supabase Setup (RLS + Admin)
Admin authorization is enforced in the database via RLS (not only in the frontend).

Run the SQL files in `supabase/migrations/` using the Supabase SQL Editor:
- `20260315154736_2c623f42-d9c9-480b-93d1-a9d892890b8c.sql`
- `20260319000001_crestline_listings.sql`
- `20260325000100_admin_rls_and_admin_role.sql`

Key concepts:
- `public.user_roles` stores role-based access (e.g. `role='admin'`)
- `public.admin_email_whitelist` bootstraps admin access by email
- `public.is_admin()` is used by RLS policies to protect admin-managed data

## Seed Demo Data (Optional)
To generate realistic demo content for UI testing:
- `supabase/seed_reviews.sql` (creates `public.reviews` + review RLS policies)
- `supabase/seed_demo_realistic_data_v2.sql` (inserts listings, images, inquiries, reviews)

## AI Chat (Supabase Edge Function)
AI chat endpoint implementation:
- `supabase/functions/chat/index.ts`

Set secrets in your Supabase project for the model provider you want:
- `GROQ_API_KEY` and/or `OPENAI_API_KEY`

Deploy the function:
- `supabase functions deploy chat` (or deploy from the Supabase dashboard)

## Vercel Deployment
This is a single-page app; `vercel.json` includes a rewrite so deep links load `index.html`.

Checklist:
- Connect your GitHub repo to Vercel
- Set required environment variables in Vercel (matching `.env.local`)
- Build command: `npm run build`
- Deploy branch: `main`

