# Architecture overview

## Components

```text
React + YouTube IFrame API  <--- Socket.IO --->  Express + Socket.IO
          |                                             |
          +------------- room UI -----------------------+
                                                        |
                                                 Room service / JSON store
```

The browser uses the YouTube IFrame API to render and control the video. It
does not trust itself for authorization: every state-changing action is sent to
the Node server, which finds the sender from their socket and checks their role.

## Room state

`Room` owns participants, host ID, video ID, play state, current position,
last-update timestamp, control requests, and capped chat history. `Participant`
owns an opaque UUID, display name, role, socket ID, and join time. The room
service keeps active rooms in memory and serializes them to
`backend/data/db.json` after each room-changing action.

The playback timestamp is important: while a video is playing, the server adds
the elapsed time to the stored position when it sends room state. A participant
who joins midway therefore starts near the current video position instead of
the last play/seek event position.

## Event flow

1. `create_room` creates a `Room` and makes its creator host. `join_room`
   assigns normal joiners the participant role and returns the complete state.
2. A host or moderator emits `play`, `pause`, `seek`, or `change_video`.
   The server validates the role, stores the new state, then broadcasts
   `sync_state` to other sockets in the room.
3. The receiving client updates the YouTube player without sending the remote
   action back to the server, preventing feedback loops.
4. Only the host may emit `assign_role`, `remove_participant`, or
   `transfer_host`. Corresponding broadcasts refresh every participant list.
5. On an unexpected disconnect, the server keeps the participant for 20
   seconds. A reconnect with the saved participant ID restores the same role;
   otherwise the participant is removed after the grace period. Explicit Leave
   removes them immediately.

## Security and MVP trade-offs

Roles are resolved from server-side room state, never from a client-supplied
role. Names and chat messages are length-limited, playback times are clamped,
and room codes are normalized. This is an MVP: JSON persistence is suitable for
a single Node process, but production multi-instance scaling should replace it
with a database and Socket.IO's Redis adapter. There is no account-based
authentication, so the participant ID stored in the browser is only a
convenience for reconnecting, not a security credential.
