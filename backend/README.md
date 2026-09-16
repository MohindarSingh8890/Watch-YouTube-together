# Watch Party Backend

Real-time YouTube watch-party server. Rooms, participants, playback state and
chat history persist to a single local JSON file at `data/db.json`, so a
restart doesn't wipe active rooms. There's no real database — by design.

## Run it

```bash
cd Watch_Party_System/backend
npm install
cp .env.example .env
npm run dev
```

`.env` only has two things: `PORT` and `CLIENT_URL`. CLIENT_URL can be a
comma-separated list if you need to allow multiple frontend origins.

## Bits that matter

- REST is minimal on purpose: `GET /health` and `GET /api/rooms/:roomCode/exists`.
  Everything else goes over socket.io.
- Room code: 6 uppercase chars, skips ambiguous letters (O/0, I/1).
- Three roles — host, moderator, participant. Host has full control, mods can
  drive playback, participants just watch. Role checks happen server-side off
  the current room state, whatever the client sends is ignored.
- If the host disconnects, the person who's been in the room longest takes over
  automatically. When the last person leaves, the room is deleted.
- State is stored in `data/db.json` — a JSON file read on boot and rewritten on
  every room-changing event. If the file is missing or corrupt the server just
  starts with an empty state and recreates it.
- Chat history is capped at the last 100 messages per room.
- `request_control` just pings the rest of the room — the host approves by
  calling `assign_role` themselves.

## Events

Client -> server: `create_room`, `join_room`, `leave_room`, `play`, `pause`,
`seek`, `change_video`, `assign_role`, `remove_participant`, `transfer_host`,
`request_control`, `chat_message`, `reaction`

Server -> client: `sync_state`, `user_joined`, `user_left`, `role_assigned`,
`participant_removed`, `host_transferred`, `control_requested`, `chat_message`,
`reaction`, `error_event`

`create_room` and `join_room` take a callback (ack) — they hand back the room
state plus your participant. Everything else either acks `{ ok: true }` /
`{ ok: false, message }` or just fires nothing back.

## Scripts

- `npm start` — run with node
- `npm run dev` — run with nodemon, auto-restarts on changes