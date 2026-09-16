# Watch Party System

Watch YouTube videos together in real-time. Create a room, share the code,
everyone watches in sync.

## Current status

UI/UX prototype only. All data is mocked on the frontend - no real
WebSocket connections, no real auth, no real YouTube integration yet.
The interface is fully clickable so it can be demoed and reviewed.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open the printed localhost URL.

## What's here

- Home page - create or join a room
- Room page - video player with mock controls, participant list with role
  badges, host action menus, chat, reactions
- Role flow - host can promote to moderator, remove people, transfer host
- Participant view - playback controls locked, request-control button
- Join / not-found / pending approval screens

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Framer Motion (modals/toasts)
- Lucide icons

Backend skeleton lives in `backend/` and is intentionally empty for now.
See `docs/architecture-overview.md` for the planned design.