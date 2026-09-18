# WatchParty

A real-time YouTube watch party application. Create a room, share its code or
link, and watch the same video together with role-based controls.

## Production Deployment

Live Application: https://watch-youtube-together.onrender.com/

The application is deployed on Render and is publicly accessible.

## Features

- Socket.IO synchronization for play, pause, seeking, and changing videos
- YouTube IFrame Player integration
- Unique six-character room codes and shareable room URLs
- Host, moderator, and participant roles; permissions are enforced by the server
- Host actions: promote/demote, remove participants, and transfer ownership
- Reconnect grace period so a brief network drop does not lose a participant's role
- Persisted room state and last 100 chat messages in `backend/data/db.json`
- In-room text chat and emoji reactions
- Responsive React/Tailwind interface for desktop and mobile

## Run locally

Use two terminals.

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies API and
Socket.IO traffic to `http://localhost:5000`.

`backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Production deployment

The backend serves `frontend/dist` when it exists, so one Node web service is
enough. Configure your host (for example Render or Railway) with:

```bash
npm ci --prefix frontend && npm run build --prefix frontend && npm ci --prefix backend
```

as the build command, and:

```bash
npm start --prefix backend
```

as the start command. Set `PORT` if the host does not provide it and set
`CLIENT_URL` to the deployed frontend origin only when frontend and backend are
hosted separately. The current live URL is listed above.

## Verification

```bash
cd frontend
npm run build
```

For a manual multi-user check, open the app in two browser windows, create a
room in one, and join its code in the other. Confirm playback sync, role
changes, removal, chat, and a short disconnect/reconnect.

## Stack

- React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Node.js, Express, Socket.IO
- YouTube IFrame Player API
- Local JSON persistence (intentional MVP trade-off)

See [the architecture overview](docs/architecture-overview.md) for the event
flow and design decisions.
