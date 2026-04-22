# 🌸 Blossoms Wellbeing Tracker

A gentle daily check-in for clients of **Blossoms Counselling Co.** Clients log
their mood, anxiety, sleep quality, gratitude and private notes — and, if they
choose, share that journey with their therapist Teresa.

Built with **Next.js 14 (app router)**, **Supabase** (auth + Postgres + RLS),
**Tailwind CSS** and **Recharts**. Deploy-ready for Vercel.

---

## Design

Matches the existing blossomscounsellingco.co.uk visual identity:

| Token        | Value                                      |
| ------------ | ------------------------------------------ |
| Background   | `#f5f0ee` warm blush off-white             |
| Primary/sage | `#5a7d6b` muted sage green                 |
| Text         | `#2c3e35` dark charcoal green              |
| Headings     | Cormorant Garamond (serif, Google Fonts)   |
| Body         | Inter                                      |

Buttons are rounded and filled (primary) or outlined (secondary). Cards have
soft shadows and generous padding. The logo is the text "Blossoms Counselling
Co." with a 🌸 blossom.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Supabase setup

1. Create a free project at <https://supabase.com>.
2. In the project dashboard, copy the **Project URL** and the **anon public
   API key** (Project Settings → API).
3. Open the SQL editor and run the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This creates the `profiles`
   and `checkins` tables, the new-user trigger, and all row-level security
   policies.
4. (Optional) Under Authentication → Providers, disable "Confirm email" while
   developing so sign-ups log in immediately. In production leave email
   confirmation enabled.

#### Marking the therapist account

Any profile row with `is_therapist = true` can view the `/therapist` page. The
column is protected against client-side edits by a trigger, so it must be set
from the SQL editor:

```sql
-- After Teresa has signed up through the app:
update public.profiles
set is_therapist = true
where email = 'teresa@example.com';
```

### 3. Environment variables

Copy `.env.example` → `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add the same two env vars (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings.
4. Under Supabase → Authentication → URL Configuration, add your Vercel
   production URL (and preview URLs if desired) to the allowed redirect list.

---

## Features

- **Email + password auth** via Supabase Auth.
- **Daily check-in form** — mood, anxiety, sleep (all 1–10 sliders), gratitude
  journal, private notes. A DB unique constraint on `(user_id, date)` prevents
  more than one entry per day.
- **Client dashboard** — today's form (or the read-only view once logged),
  plus a Recharts line chart of history.
- **Settings page** — toggle sharing with Teresa on or off at any time.
- **Therapist dashboard** at `/therapist` — lists every client with
  `sharing_enabled = true` and shows each of their last 30 days as a line
  chart. Gated by the `is_therapist` flag and RLS.
- **Row-level security** — clients can only see their own data; the
  therapist can only read check-ins from clients who currently have sharing
  turned on.

---

## Data model

### `profiles`
| Column            | Type      | Notes                                     |
| ----------------- | --------- | ----------------------------------------- |
| `id`              | `uuid`    | PK, references `auth.users(id)`           |
| `email`           | `text`    | Copied from `auth.users` on signup        |
| `is_therapist`    | `boolean` | Trigger prevents client edits             |
| `sharing_enabled` | `boolean` | Default `false`, toggled from `/settings` |

### `checkins`
| Column      | Type       | Notes                             |
| ----------- | ---------- | --------------------------------- |
| `id`        | `uuid`     | PK                                |
| `user_id`   | `uuid`     | FK → `profiles.id`                |
| `date`      | `date`     | unique per user — one entry / day |
| `mood`      | `smallint` | 1–10                              |
| `anxiety`   | `smallint` | 1–10                              |
| `sleep`     | `smallint` | 1–10                              |
| `gratitude` | `text`     | nullable                          |
| `notes`     | `text`     | nullable                          |

### Row-level security summary

- Clients → full CRUD on their own `checkins` only.
- Therapist → read-only on `checkins` where the owner's profile has
  `sharing_enabled = true`.
- Anyone → read/update their own `profiles` row (but `is_therapist` is
  locked by a trigger).
- Therapist → may also read profiles where `sharing_enabled = true` (so the
  dashboard can list clients).

---

## Project structure

```
app/
  layout.tsx           — fonts + global shell
  page.tsx             — landing page
  login/               — sign-in form
  signup/              — sign-up form
  dashboard/           — daily check-in + history chart (client view)
  settings/            — sharing toggle
  therapist/           — therapist overview of shared clients
components/            — Nav, Logo, Footer, HistoryChart, SignOutButton
lib/
  supabase/            — browser, server and middleware clients
  date.ts              — small date helpers
  types.ts             — shared TS types
supabase/schema.sql    — schema + RLS + triggers
```

---

## Licence

Built for Blossoms Counselling Co.
