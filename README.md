# vibe-coding-fitness
Spec-Driven Vibe Coding

# FitTrack Pro

Full-stack fitness tracking application built with Python FastAPI backend, React + Vite frontend, and Supabase.

## Structure

- **backend/**: FastAPI server with Supabase integration and Gemini AI service.
- **frontend/**: React + Vite (TypeScript) UI using Tailwind CSS, Zustand, Recharts.

## Setup

1. **Backend**
   - Copy `.env.example` to `.env` and fill values.
   - Create guest account in Supabase and set `GUEST_EMAIL`/`GUEST_PASSWORD`.
   - **Alternatively:** you can leave the vars empty and the server will run in dummy mode, providing an in-memory fake Supabase and a guest session so you can log in without real credentials. This is useful for quick local testing. AI features will also return placeholder responses.
   - Install dependencies: `pip install -r requirements.txt`.
   - Run with `uvicorn main:app --reload`.

2. **Frontend**
   - Copy `.env.example` to `.env` and fill values.
   - Install dependencies: `npm install` (or `yarn`).
   - Run dev server: `npm run dev`.

## Database

Execute schema SQL in Supabase SQL editor (see project specification).

## UX / UI (Design Guidelines)

The FitTrack Pro frontend is built with a strict visual system that supports accessibility, hierarchy, and ease of use.

### Color System

- **Primary (green triad)**: #16a34a (base), #22c55e (bright), #4ade80 (highlight) for calls to action and success states.
- **Secondary (indigo triad)**: #3b4fd8 (base), #6366f1 (bright), #818cf8 (highlight) for information, charts, and AI elements.
- **Accent (amber triad)**: #d97706 (base), #f59e0b (bright), #fbbf24 (highlight) for warnings, energy, and attention.
- **Neutrals**: #09090b, #111113, #18181b, #27272a, #3f3f46, #71717a, #a1a1aa, #d4d4d8, #f4f4f5.
- **Semantic colors**: green for positive/cta, indigo for AI/info, amber for warning, red for destructive actions.

### Typography

- Body: **DM Sans** 400/500
- Headings & stats: **Barlow Condensed** 600/700
- Contrast ratio 4.5:1 minimum. Light text on dark backgrounds, dark text on light accent backgrounds.

### Layout & Spacing

- 8‑point grid used consistently for margins/padding.
- Sidebar 240px wide on desktop, collapses to bottom nav on mobile (<768px).
- Cards stack via darkening values rather than shadows: background #09090b → page surface #111113 → card #18181b → raised #27272a.

### Motion

- Entrance animations: 200ms ease-out.
- Hover transitions: 150ms, only transform + opacity.
- Skeletons use `animate-pulse` with #27272a blocks matching content shape.

### Components

Implemented UI according to spec:

- **LoginPage** split screen with grid pattern, animated left half and auth card.
- **DashboardPage** with stats row, charts, guest banner, workout list, AI card, modals, responsive sidebar.
- Tailwind utilities capture all colors, spacing, and typography.

## AI

Uses Google Gemini via `gemini-1.5-flash` model. Set `GEMINI_API_KEY` in backend `.env`.

## License

This repository is for demonstration purposes.
