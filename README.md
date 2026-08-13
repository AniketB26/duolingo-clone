# Lingo — Duolingo-style web clone

SDE fullstack assignment: a **Spanish learning path** with a real lesson loop (five exercise types), XP, streaks, hearts, a seeded leaderboard, and a Duolingo-like UI. Original work — not a copy of Duolingo source or Duo the owl.

**Live stack**

| Layer | Tech | Host |
|---|---|---|
| Frontend | Next.js 15 (TypeScript, App Router, Tailwind) | Vercel (`frontend/`) |
| Backend | Python FastAPI + Uvicorn | Render (`backend/`) |
| Database | SQLite + SQLAlchemy 2.0 | File on the Render instance (`backend/data/app.db`) |

Repo: https://github.com/AniketB26/duolingo-clone

---

## What the app does

- **Learn path** — Units and skills in a winding path. Locked / available / completed, crown rings, first skill unlocked.
- **Lesson player** — Multiple choice, tap-the-words translate, match pairs, fill in the blank, type the answer. Immediate green/red feedback, lesson progress bar, out-of-hearts and lesson-complete modals.
- **Gamification** — XP on complete, daily XP goal, timezone-aware streak, 5 hearts (lose one on a wrong answer; 1 heart / 4 hours or practice refill).
- **Profile** — Stats and simple achievements derived from XP / streak / lessons.
- **Leaderboard** — All-time XP among seeded learners plus you.
- **Dark mode** — Top bar and Settings; persisted in the browser.
- **Responsive** — Bottom nav on phone; side nav + daily-goal rail on large screens.
- **Placeholders** — Shop / Super / gems economy, friends, speech, Sound settings.

One course (Spanish for English speakers), one default logged-in learner (`aniket`, user id `1`). No JWT.

---

## Local setup

Needs **Python 3.13** (3.11+ may work; Render is pinned to **3.13.3**) and **Node 20+**.

### API

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  
- SQLite is created at `backend/data/app.db` and **seeded on first boot**.

### Web

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000  

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Architecture

```
Browser (Next.js)
  TanStack Query  →  GET/POST FastAPI
  Zustand         →  in-lesson UI only (index, selected answer, feedback)

FastAPI
  Pydantic schemas
  SQLAlchemy models
  SQLite file
```

- **Server grades answers.** `GET /api/lessons/{id}` does not send solutions. Hearts, XP, and streaks are written on the server.
- **Lock/unlock** is computed when building the course tree: a skill opens when the previous skill’s lessons are all complete; inside a skill, lessons are sequential.
- **Hearts** regenerate lazily on each request (`last_heart_regen_at`, +1 per 4 hours, cap 5).
- **Streaks** use the client IANA timezone on lesson complete vs `last_active_at` in UTC.

```
frontend/src/app/     pages: /, /lesson/[id], /leaderboard, /profile, /shop, /settings
frontend/src/components/
backend/app/models.py
backend/app/routers/  app.py (me, tree, profile, leaderboard, refill)
                      lessons.py (get, submit-answer, complete)
backend/app/seed.py
backend/app/gamification.py
```

---

## Database

- `users` — XP, streak, hearts, gems (mocked), daily XP window, timezone  
- `courses` → `units` → `skills` → `lessons` → `exercises`  
- `exercises` — `exercise_type` + JSON `content` / `solution`  
- `user_progress` — per-user lesson completion and crowns  
- `app_meta` — one-time seed version (`v2-unplayed` so Greetings is not pre-completed)

New databases start with **no completed lessons**. Leaderboard still includes extra seeded users (Maya, Leo, …).

---

## HTTP API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness |
| GET | `/api/me` | Current learner (hearts, XP, streak, gems, daily goal) |
| GET | `/api/courses/{id}/tree` | Path with lock/unlock and crowns |
| GET | `/api/lessons/{id}` | Exercises **without** solutions; word banks shuffled |
| POST | `/api/lessons/{id}/submit-answer` | Grade one item; maybe lose a heart |
| POST | `/api/lessons/{id}/complete` | XP, streak, persist progress |
| POST | `/api/practice/refill-hearts` | Mocked practice → 5 hearts |
| GET | `/api/leaderboard` | All-time XP |
| GET | `/api/profile` | Stats + derived achievements |

---

## Deploy

GitHub `main` is the source. **Root directories:** Render = `backend`, Vercel = `frontend`.

### Render

- Build: `pip install -r requirements.txt`  
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
- Env: `PYTHON_VERSION=3.13.3` (required; 3.14 cannot install our `pydantic-core` wheel), `CORS_ORIGINS=<vercel origin>`, `DEFAULT_USER_ID=1`  
- Free instances sleep; SQLite can reset — the API **re-seeds an empty DB** on boot. A versioned migrate also clears the old “Greetings 1 already done” seed once.

### Vercel

- Env: `NEXT_PUBLIC_API_URL=https://duolingo-clone-77fb.onrender.com` (no trailing slash)

After each `git push` to `main`, wait for Render **Live**, then Vercel **Ready**, then hard-refresh the site.

---

## Assumptions

- One language course; default user; gems mocked; no payments; no speech recognition; no Howler audio engine.
- UI name **Lingo** and an original owl SVG (not Duo IP).
- Dark mode is implemented; Sound in Settings is still Coming Soon.
