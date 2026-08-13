# Implementation Decisions

Living log of architectural choices for this Duolingo clone. Each entry records the problem, options, the choice, rejected alternatives, and effects.

---

## 1. Backend framework: FastAPI (not Django)

**Context:** The assignment allows Python with FastAPI *or* Django.

**Options:** FastAPI; Django REST Framework; Django + templates.

**Choice:** FastAPI + Uvicorn.

**Why this is correct:** The product is a JSON API for a separate Next.js SPA. FastAPI gives typed request/response models, OpenAPI, and async I/O with little boilerplate. That matches a lesson player that posts answers frequently.

**Rejected:**
- Django REST Framework — extra ORM/admin weight we do not need; slower to stand up a small REST surface in ~16 hours.
- Django templates — would fight the required Next.js frontend.

**Effects:** `backend/` is a pure API. Frontend owns all UI. Deploy target is a Render Web Service running Uvicorn.

---

## 2. Persistence: SQLite + SQLAlchemy 2.0

**Context:** Assignment requires SQLite and a designed schema.

**Options:** Raw `sqlite3`; SQLAlchemy; Django ORM (only if Django).

**Choice:** SQLAlchemy 2.0 mapped models + `sqlite:///./data/app.db`.

**Why this is correct:** Relationships (course → unit → skill → lesson → exercise, plus `user_progress`) are the evaluation surface. An ORM keeps foreign keys and seed scripts readable without leaving SQLite.

**Rejected:** Raw SQL — more error-prone for nested trees and JSON exercise payloads.

**Effects:** JSON columns on `exercises` for polymorphic content. Seed-on-boot because Render’s free disk can wipe SQLite.

---

## 3. Frontend: Next.js App Router + TypeScript

**Context:** Assignment mandates Next.js (TypeScript).

**Options:** Pages Router; App Router.

**Choice:** App Router under `frontend/`.

**Why this is correct:** Vercel’s default for new Next apps. Server Components for shell layout; client components for the lesson player.

**Rejected:** Pages Router — extra legacy routing for no gain.

**Effects:** Vercel Root Directory = `frontend`. Env var `NEXT_PUBLIC_API_URL` points at Render.

---

## 4. Styling: Tailwind + Duolingo tokens (not CSS modules)

**Context:** UI must resemble Duolingo; Gemini research specified hex tokens.

**Options:** CSS modules; styled-components; Tailwind with CSS variables.

**Choice:** Tailwind 3 + CSS variables for Feather Green, Cardinal, Bee, etc. Nunito / Varela Round via `next/font`.

**Why this is correct:** Tokens stay one source of truth; responsive `md:` / `lg:` breakpoints match the bonus requirement. Proprietary Feather Bold / DIN Next are not licensed — Nunito / Varela Round are the documented substitutes.

**Rejected:** CSS modules — slower to hit a dense gamified UI. Dark mode (bonus) — out of scope.

**Effects:** 3D buttons use `box-shadow` + `translateY` (GPU) instead of `border-bottom` (layout shift).

---

## 5. Client state: Zustand (lesson) + TanStack Query (server)

**Context:** Lesson loop mutates quickly; path/profile come from the API.

**Options:** Redux; React Context only; Zustand + React Query; only fetch.

**Choice:** Zustand for in-lesson UI; TanStack Query for GET/mutations and cache invalidation.

**Why this is correct:** These are libraries *inside* Next.js, not a second stack. They split ephemeral session state from persisted user/course data, which is the Gemini architecture and avoids Redux boilerplate under a 16-hour deadline.

**Rejected:** Redux — too much ceremony. Context-only — extra re-renders in the player.

**Effects:** Completing a lesson invalidates `me`, `tree`, `profile`, `leaderboard`.

---

## 6. Auth: default logged-in learner (no JWT)

**Context:** Assignment allows simplified auth.

**Options:** JWT; session cookies; hardcoded default user id.

**Choice:** Server treats `DEFAULT_USER_ID=1` as the current learner.

**Why this is correct:** Evaluation cares about the lesson loop and persistence, not identity. JWT would consume hours without scoring.

**Rejected:** Real signup/login.

**Effects:** No auth headers. All progress writes attach to user 1.

---

## 7. Exercise polymorphism: Pydantic discriminated unions + JSON columns

**Context:** Five exercise types with different payloads.

**Options:** One table per type; single table + JSON; separate microservices.

**Choice:** `exercise_type` discriminator + JSON `content` / `solution`. Grade on the **server**.

**Why this is correct:** One lesson endpoint can return a mixed list. Clients never decide XP/hearts. Cheating the UI cannot complete a skill.

**Rejected:** Client-only grading — progress would not be trustworthy. Per-type tables — more migrations for the same seed.

**Effects:** `GET /lessons/{id}` omits `solution`. `POST submit-answer` returns correctness and the solution only after submit.

---

## 8. Hearts: lazy regeneration + mocked practice refill (no cron)

**Context:** Must lose hearts on wrong answers and regenerate or refill.

**Options:** Background cron; lazy eval on request; Super unlimited hearts.

**Choice:** Store `hearts` + `last_heart_regen_at`. On each authenticated request, add `floor(elapsed / 4 hours)` hearts, cap 5. Practice endpoint refills to 5.

**Why this is correct:** SQLite on Render has no reliable worker. Lazy eval is correct at request time and testable.

**Rejected:** Cron (`fastapi-crons`) — extra process on a single web dyno. Super IAP — placeholder only.

**Effects:** Out-of-hearts modal blocks the lesson until refill or regen.

---

## 9. Streak: timezone-aware calendar days (no streak freeze)

**Context:** Streak must increment on daily activity and be testable.

**Options:** UTC-only; client-only; server UTC + client IANA timezone.

**Choice:** Persist `last_active_date` in UTC; client sends IANA timezone on complete. Compare local calendar days: 0 = already counted, 1 = increment, >1 = reset to 1.

**Why this is correct:** UTC-only breaks around midnight for the learner. Freeze requires a gem shop we are not building.

**Rejected:** Device-clock-only streak (tamperable, wrong). Streak freeze (Shop is Coming Soon).

**Effects:** Completing a lesson is the daily activity event.

---

## 10. Split deploy: Vercel (Next) + Render (FastAPI)

**Context:** Assignment requires a hosted demo. User has Vercel + Render.

**Options:** Single host for both; Vercel serverless Python; Render static + API.

**Choice:** `frontend/` → Vercel. `backend/` → Render Web Service. CORS from `CORS_ORIGINS`.

**Why this is correct:** Matches how each platform is strongest. Next.js on Vercel; long-lived Python + SQLite file on Render.

**Rejected:** Django on Render with Next unused. Vercel Python serverless — poor fit for a SQLite file and FastAPI lifespan seed.

**Effects:** `NEXT_PUBLIC_API_URL` on Vercel. `CORS_ORIGINS` on Render must include the Vercel origin. Seed on API startup.

---

## 11. Scope cut: core + responsive only

**Context:** User asked for must-haves plus responsive design from bonuses.

**Choice:** No Howler/audio sprites, no dark mode, no weekly leagues, no legendary timer, no friends, no Super checkout.

**Why this is correct:** 16-hour deadline. Audio and dark mode are optional. Placeholders keep the chrome Duolingo-like.

**Rejected:** Full Gemini audio engine — not in the assignment stack and not in current scope.

**Effects:** Mute control is visual only. Shop/settings show Coming Soon.

---

## 12. Brand assets: original owl, not Duo IP

**Context:** Must feel like Duolingo without copying trademarked mascot art.

**Choice:** Simple original owl SVG + playful copy. Exact public color tokens from research.

**Rejected:** Scraping Duo illustrations — plagiarism/IP risk.

**Effects:** “Lingo” as product name in UI; README states it is an assignment clone.

---

## 13. Fonts: runtime CSS instead of next/font

**Context:** `next/font/google` downloads files during `next build`. This environment hit `ECONNRESET` / socket hang up.

**Options:** next/font; `<link>` to Google Fonts; system-only fonts.

**Choice:** `<link>` in `layout.tsx` for Nunito and Varela Round, with system-ui fallback.

**Why this is correct:** Same typefaces, build no longer depends on Google. Vercel builds usually can use next/font; this is more resilient.

**Rejected:** next/font at build time (network flake). Skipping branded fonts entirely (weaker Duolingo feel).

**Effects:** First page load may request fonts.googleapis.com.

---

## 14. Next.js outputFileTracingRoot

**Context:** A `package-lock.json` in `C:\Users\admin` made Next infer the wrong workspace root.

**Choice:** Set `outputFileTracingRoot` to the `frontend/` directory.

**Rejected:** Leaving the warning — Vercel/local traces could bundle the wrong tree.

**Effects:** [frontend/next.config.ts](frontend/next.config.ts)

---

## 15. Lesson route uses `useParams`, not `use(params)`

**Context:** Opening Greetings (`/lesson/2`) crashed the Next.js webpack worker (`Jest worker encountered 2 child process exceptions`). The error overlay also reported Next 14.2.3 because Next walked up to `C:\Users\admin\package-lock.json` and treated the home folder as the workspace.

**Options:** Keep `use(Promise params)` (Next 15 App Router); read id with `useParams()`; disable webpack workers; add a repo-root lockfile.

**Choice:** Client page reads `id` via `useParams()`. Repo-root `package-lock.json` stops the lockfile walk. `webpackBuildWorker: false` and `turbopack.root` pin the frontend folder.

**Why this is correct:** `use(params)` is easy to miscompile when a parent Next 14 install is on the path. `useParams()` is stable in the App Router. A root lockfile keeps tooling inside this repo.

**Rejected:** Leaving the Promise-params page (reproduced the crash). Deleting the user’s home `package-lock.json` (out of project scope).

**Effects:** Greetings in Unit 1 opens the next incomplete lesson without a worker crash.

---

## 16. Pin Python 3.13 on Render (not 3.14)

**Context:** Render’s default interpreter was Python 3.14. `pydantic-core==2.33.1` has no 3.14 wheel, so pip tried to compile Rust (`maturin`) and failed: read-only `/usr/local/cargo`.

**Options:** Upgrade pydantic to a 3.14 wheel; compile Rust on Render; pin `PYTHON_VERSION=3.13.3`.

**Choice:** Pin 3.13.3 via `backend/.python-version`, `runtime.txt`, and Render env `PYTHON_VERSION`. Matches local Python 3.13.3.

**Rejected:** Building pydantic-core from source (no writable Cargo cache). Jumping pydantic versions mid-deploy without testing.

**Effects:** Render must use 3.13. If the dashboard still shows 3.14, set `PYTHON_VERSION` to `3.13.3` and redeploy.

