# Architecture Overview (Planned)

This document is a placeholder for the next development phase.

## Intended design

- Frontend: React + TS (already scaffolded in `frontend/`)
- Backend: Node.js + Express + Socket.IO
- Realtime: WebSocket events for play/pause/seek/change-video/role changes
- Storage: single local JSON file (`backend/data/db.json`)
- Video: YouTube IFrame Player API

## Key flows to implement

1. Room lifecycle - create/join/leave, room codes
2. Control events - server validates the sender's role before broadcasting
3. Sync - host/mod actions fan out to all room members
4. Roles - host assigns moderator/participant; host transfer with warning
5. Optional - chat persistence, reactions, pending-approval queue

## Client <> server event sketch (to be filled in)

- client emits `control:play` -> server checks role -> broadcasts `sync:state`