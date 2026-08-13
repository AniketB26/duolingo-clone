# Duolingo Clone (assignment)

Functional Duolingo-style web app: Spanish path, five exercise types, XP / streak / hearts, seeded leaderboard. Built for a SDE fullstack assignment.

- **Frontend:** Next.js (TypeScript) — deploy on **Vercel** (`frontend/`)
- **Backend:** Python FastAPI — deploy on **Render** (`backend/`)
- **Database:** SQLite via SQLAlchemy

This is original assignment work, not a copy of Duolingo’s source or trademarked owl art.

## Local setup

Requires Python 3.11+ and Node 20+.

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs  

SQLite file is created at `backend/data/app.db` and seeded on first boot (Spanish course + default learner `aniket`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000  

`frontend/.env.local` already points at `http://localhost:8000`. Copy from `.env.example` if needed:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture

The Next.js app calls the FastAPI REST API. There is one default logged-in learner (no JWT). The lesson player keeps ephemeral UI state in Zustand; course/user data is fetched with TanStack Query. Hearts regenerate lazily (1 every 4 hours, cap 5). Streaks use the browser timezone on lesson complete. See [implementation_decision.md](implementation_decision.md) for every choice and rejected alternative.

```
frontend/          Next.js App Router
backend/app/       FastAPI, models, seed, routers
backend/data/      SQLite (gitignored except .gitkeep)
```

## Database schema

- `users` — XP, streak, hearts, gems (mocked), daily XP
- `courses` → `units` → `skills` → `lessons` → `exercises`
- `exercises` — `exercise_type` + JSON `content` / `solution`
- `user_progress` — per-user lesson completion and crowns

## API overview

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness |
| GET | `/api/me` | Current learner + hearts/XP/streak |
| GET | `/api/courses/{id}/tree` | Path with lock/unlock |
| GET | `/api/lessons/{id}` | Exercises (no solutions) |
| POST | `/api/lessons/{id}/submit-answer` | Grade one item, maybe lose a heart |
| POST | `/api/lessons/{id}/complete` | Award XP, streak, progress |
| POST | `/api/practice/refill-hearts` | Mocked practice refill |
| GET | `/api/leaderboard` | Seeded all-time XP |
| GET | `/api/profile` | Stats + simple achievements |

## Assumptions

- One course: Spanish for English speakers.
- Auth is a single default user (`id=1`).
- Audio, Super, friends, dark mode, and legendary mode are placeholders or omitted.
- Gems are mocked; shop is Coming Soon.

## Deploy (manual — Vercel + Render)

Do this after local testing. You already have the GitHub repo: https://github.com/AniketB26/duolingo-clone

### 1. Push this code

Commit and push `main` to GitHub.

### 2. Render (API)

1. [dashboard.render.com](https://dashboard.render.com) → New → Web Service → connect `AniketB26/duolingo-clone`.
2. **Root Directory:** `backend`
3. **Runtime:** Python
4. **Build:** `pip install -r requirements.txt`
5. **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Env vars:
   - `CORS_ORIGINS` = your Vercel URL (e.g. `https://duolingo-clone.vercel.app`) — you can add this after Vercel exists; meanwhile leave `http://localhost:3000` and rely on the `*.vercel.app` regex already in code.
7. Create the service. Copy the Render URL, e.g. `https://duolingo-clone-api.onrender.com`.

Free Render disks can reset; the API **re-seeds an empty database on boot**.

### 3. Vercel (web)

1. [vercel.com](https://vercel.com) → Add New Project → import `AniketB26/duolingo-clone`.
2. **Root Directory:** `frontend`
3. Framework: Next.js (auto)
4. Env:
   - `NEXT_PUBLIC_API_URL` = Render URL **with no trailing slash** (e.g. `https://duolingo-clone-api.onrender.com`)
5. Deploy.

### 4. CORS finish

On Render, set `CORS_ORIGINS` to the exact Vercel origin and redeploy the API if preview URLs are blocked.

## Evaluation notes

Core loop: path → lesson → check → hearts → complete → XP/streak persist. UI uses Duolingo tokens (Feather Green, Cardinal, etc.) and tactile 3D buttons. Responsive: bottom nav on mobile, side nav + daily-goal rail on large screens.
