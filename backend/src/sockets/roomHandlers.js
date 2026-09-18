const EVENTS = require("../constants/events");
const { ROLES } = require("../constants/roles");
const Participant = require("../models/Participant");
const roomService = require("../services/roomService");
const { isHost, canControlPlayback } = require("../utils/permissions");

// socket.id -> { roomCode, participantId }
const socketRoomMap = new Map();
const disconnectTimers = new Map();
const RECONNECT_GRACE_MS = 20_000;

function registerRoomHandlers(socket, io) {
  socket.on(EVENTS.CREATE_ROOM, (payload, ack) => {
    const username = sanitizeUsername(payload?.username);
    if (!username) {
      return ack?.({ ok: false, message: "Username is required" });
    }

    const host = new Participant(username, socket.id);
    const room = roomService.createRoom(host);
    socketRoomMap.set(socket.id, { roomCode: room.code, participantId: host.id });
    socket.join(room.code);

    ack?.({
      ok: true,
      room: room.getPublicState(),
      participant: host.toJSON(),
    });
  });

  socket.on(EVENTS.JOIN_ROOM, (payload, ack) => {
    const username = sanitizeUsername(payload?.username);
    const roomCode = payload?.roomCode?.toUpperCase();

    if (!username) return ack?.({ ok: false, message: "Username is required" });
    if (!roomCode || !roomService.roomExists(roomCode)) {
      return ack?.({ ok: false, message: "Room not found" });
    }

    const room = roomService.getRoom(roomCode);
    const returning =
      takeReturningParticipant(room, payload?.participantId, username, socket.id) ||
      reclaimIdleParticipant(room, username, io, socket.id);

    if (!returning && payload?.participantId) {
      return ack?.({ ok: false, message: "Session expired or no longer valid" });
    }

    const participant = returning || new Participant(username, socket.id);
    if (!returning) room.addParticipant(participant);
    cancelDisconnectCleanup(participant.id);
    dropStaleSockets(io, socket.id, participant.id);

    socketRoomMap.set(socket.id, { roomCode: room.code, participantId: participant.id });
    socket.join(room.code);

    if (!returning) {
      socket.to(room.code).emit(EVENTS.USER_JOINED, {
        username,
        userId: participant.id,
        role: participant.role,
        participants: room.participantsList(),
      });
    }

    ack?.({
      ok: true,
      room: room.getPublicState(),
      participant: participant.toJSON(),
      chatHistory: room.chatHistory,
    });
  });

  socket.on(EVENTS.LEAVE_ROOM, () => {
    leaveRoom(socket, io);
  });

  socket.on(EVENTS.PLAY, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withControlPermission(socket, ack, ctx)) return;

    const t = clampTime(payload?.currentTime);
    ctx.room.setPlayback({ isPlaying: true, currentTime: t });
    roomService.saveRooms();
    ack?.({ ok: true });
    broadcastPlayback(socket, ctx);
  });

  socket.on(EVENTS.PAUSE, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withControlPermission(socket, ack, ctx)) return;

    const t = clampTime(payload?.currentTime);
    ctx.room.setPlayback({ isPlaying: false, currentTime: t });
    roomService.saveRooms();
    ack?.({ ok: true });
    broadcastPlayback(socket, ctx);
  });

  socket.on(EVENTS.SEEK, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withControlPermission(socket, ack, ctx)) return;

    const t = clampTime(payload?.time);
    ctx.room.setPlayback({ currentTime: t });
    roomService.saveRooms();
    ack?.({ ok: true });
    broadcastPlayback(socket, ctx);
  });

  socket.on(EVENTS.CHANGE_VIDEO, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withControlPermission(socket, ack, ctx)) return;

    const videoId = payload?.videoId;
    if (!videoId || typeof videoId !== "string") {
      return ack?.({ ok: false, message: "No video id given" });
    }

    ctx.room.setPlayback({ videoId, isPlaying: false, currentTime: 0 });
    roomService.saveRooms();
    ack?.({ ok: true });
    broadcastPlayback(socket, ctx);
  });

  socket.on(EVENTS.ASSIGN_ROLE, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withHostPermission(socket, ack, ctx)) return;

    const { userId, role } = payload || {};
    if (!ctx.room.participants.has(userId)) {
      return ack?.({ ok: false, message: "No such participant" });
    }
    if (![ROLES.MODERATOR, ROLES.PARTICIPANT].includes(role)) {
      return ack?.({ ok: false, message: "Invalid role" });
    }

    const p = ctx.room.setRole(userId, role);
    roomService.saveRooms();
    io.to(ctx.roomCode).emit(EVENTS.ROLE_ASSIGNED, {
      userId,
      username: p.username,
      role,
      participants: ctx.room.participantsList(),
    });
    ack?.({ ok: true });
  });

  socket.on(EVENTS.REMOVE_PARTICIPANT, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withHostPermission(socket, ack, ctx)) return;

    const { userId } = payload || {};
    if (!ctx.room.participants.has(userId)) {
      return ack?.({ ok: false, message: "No such participant" });
    }
    if (userId === ctx.room.hostId) {
      return ack?.({ ok: false, message: "Can't remove the host" });
    }

    kickParticipant(ctx.room, userId, io);
    ack?.({ ok: true });
  });

  socket.on(EVENTS.TRANSFER_HOST, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (!withHostPermission(socket, ack, ctx)) return;

    const { userId } = payload || {};
    if (!ctx.room.participants.has(userId) || userId === ctx.room.hostId) {
      return ack?.({ ok: false, message: "Can't transfer to that user" });
    }

    ctx.room.transferHost(userId);
    roomService.saveRooms();
    io.to(ctx.roomCode).emit(EVENTS.HOST_TRANSFERRED, {
      newHostId: userId,
      participants: ctx.room.participantsList(),
    });
    ack?.({ ok: true });
  });

  socket.on(EVENTS.REQUEST_CONTROL, (payload, ack) => {
    const ctx = getContext(socket);
    if (!ctx) return;
    if (canControlPlayback(ctx.participant)) {
      return ack?.({ ok: false, message: "You already have playback control" });
    }

    ctx.room.pendingControlRequests.add(ctx.participant.id);
    roomService.saveRooms();
    socket.to(ctx.roomCode).emit(EVENTS.CONTROL_REQUESTED, {
      userId: ctx.participant.id,
      username: ctx.participant.username,
    });
    ack?.({ ok: true });
  });

  socket.on(EVENTS.CHAT_MESSAGE, (payload) => {
    const ctx = getContext(socket);
    if (!ctx) return;

    // guard against payloads that aren't objects (malformed clients etc.)
    const text = typeof payload?.text === "string"
      ? payload.text.trim().slice(0, 500)
      : "";
    if (!text) return;

    const entry = ctx.room.pushChat({
      userId: ctx.participant.id,
      username: ctx.participant.username,
      text,
      sentAt: Date.now(),
    });
    roomService.saveRooms();
    io.to(ctx.roomCode).emit(EVENTS.CHAT_MESSAGE_BROADCAST, entry);
  });

  socket.on(EVENTS.REACTION, (payload) => {
    const ctx = getContext(socket);
    if (!ctx) return;

    const emoji = typeof payload?.emoji === "string"
      ? payload.emoji.trim().slice(0, 10)
      : "";
    if (!emoji) return;

    socket.to(ctx.roomCode).emit(EVENTS.REACTION_BROADCAST, {
      emoji,
      userId: ctx.participant.id,
    });
  });

  socket.on("disconnect", () => {
    scheduleDisconnectCleanup(socket, io);
  });
}

function leaveRoom(socket, io) {
  const entry = socketRoomMap.get(socket.id);
  if (!entry) return;

  socketRoomMap.delete(socket.id);
  const room = roomService.getRoom(entry.roomCode);
  socket.leave(entry.roomCode);
  if (!room) return;

  const participant = room.removeParticipant(entry.participantId);
  cancelDisconnectCleanup(entry.participantId);
  if (!participant) {
    if (room.participants.size === 0) roomService.deleteRoom(room.code);
    else roomService.saveRooms();
    return;
  }

  if (room.participants.size === 0) {
    roomService.deleteRoom(room.code);
    return;
  }

  if (participant.id === room.hostId) {
    const next = room.pickNextHost();
    if (next) {
      room.hostId = next.id;
      next.role = ROLES.HOST;
      io.to(room.code).emit(EVENTS.HOST_TRANSFERRED, {
        newHostId: next.id,
        participants: room.participantsList(),
      });
    }
  }

  roomService.saveRooms();
  io.to(room.code).emit(EVENTS.USER_LEFT, {
    username: participant.username,
    userId: participant.id,
    participants: room.participantsList(),
  });
}

function scheduleDisconnectCleanup(socket, io) {
  const entry = socketRoomMap.get(socket.id);
  if (!entry) return;

  // Give reconnecting clients time to restore their session.
  socketRoomMap.delete(socket.id);
  socket.leave(entry.roomCode);
  cancelDisconnectCleanup(entry.participantId);

  const timer = setTimeout(() => {
    disconnectTimers.delete(entry.participantId);
    const room = roomService.getRoom(entry.roomCode);
    if (!room || hasLiveParticipantSocket(io, entry.roomCode, entry.participantId)) return;

    removeDisconnectedParticipant(room, entry.participantId, io);
  }, RECONNECT_GRACE_MS);
  disconnectTimers.set(entry.participantId, timer);
}

function removeDisconnectedParticipant(room, participantId, io) {
  const participant = room.removeParticipant(participantId);
  if (!participant) return;

  if (room.participants.size === 0) {
    roomService.deleteRoom(room.code);
    return;
  }

  if (participant.id === room.hostId) {
    const next = room.pickNextHost();
    if (next) {
      room.hostId = next.id;
      next.role = ROLES.HOST;
      io.to(room.code).emit(EVENTS.HOST_TRANSFERRED, {
        newHostId: next.id,
        participants: room.participantsList(),
      });
    }
  }

  roomService.saveRooms();
  io.to(room.code).emit(EVENTS.USER_LEFT, {
    username: participant.username,
    userId: participant.id,
    participants: room.participantsList(),
  });
}

function cancelDisconnectCleanup(participantId) {
  const timer = disconnectTimers.get(participantId);
  if (timer) clearTimeout(timer);
  disconnectTimers.delete(participantId);
}

function hasLiveParticipantSocket(io, roomCode, participantId) {
  return getSocketIdsByParticipant(roomCode, participantId).some((id) =>
    io.sockets.sockets.has(id)
  );
}

function broadcastPlayback(socket, ctx) {
  socket.to(ctx.roomCode).emit(EVENTS.SYNC_STATE, ctx.room.playbackState());
}

function takeReturningParticipant(room, participantId, username, socketId) {
  if (typeof participantId !== "string" || !participantId) return null;
  const p = room.participants.get(participantId);
  if (!p || p.username !== username) return null;
  p.socketId = socketId;
  return p;
}

function reclaimIdleParticipant(room, username, io, socketId) {
  for (const p of room.participants.values()) {
    if (p.username !== username) continue;
    const live = getSocketIdsByParticipant(room.code, p.id).some((id) =>
      io.sockets.sockets.has(id)
    );
    if (live) continue;
    p.socketId = socketId;
    return p;
  }
  return null;
}

function dropStaleSockets(io, newSocketId, participantId) {
  for (const [socketId, entry] of socketRoomMap) {
    if (entry.participantId !== participantId || socketId === newSocketId) continue;
    if (io.sockets.sockets.has(socketId)) continue;
    socketRoomMap.delete(socketId);
  }
}

function kickParticipant(room, userId, io) {
  const removed = room.removeParticipant(userId);
  if (!removed) return;

  // kick every socket the user has in the room (multiple tabs etc.)
  for (const socketId of getSocketIdsByParticipant(room.code, userId)) {
    const targetSocket = io.sockets.sockets.get(socketId);
    if (!targetSocket) continue;
    targetSocket.emit(EVENTS.PARTICIPANT_REMOVED, { message: "Removed by host", userId });
    targetSocket.leave(room.code);
    socketRoomMap.delete(socketId);
  }

  roomService.saveRooms();
  io.to(room.code).emit(EVENTS.PARTICIPANT_REMOVED, {
    userId,
    participants: room.participantsList(),
  });
}

function getSocketIdsByParticipant(roomCode, participantId) {
  const ids = [];
  for (const [socketId, entry] of socketRoomMap) {
    if (entry.participantId === participantId && entry.roomCode === roomCode) {
      ids.push(socketId);
    }
  }
  return ids;
}

// ---- helpers ----

function getContext(socket) {
  const entry = socketRoomMap.get(socket.id);
  if (!entry) return null;

  const room = roomService.getRoom(entry.roomCode);
  if (!room) return null;

  const participant = room.participants.get(entry.participantId);
  if (!participant) return null;

  return {
    roomCode: room.code,
    room,
    participant,
  };
}

function withControlPermission(socket, ack, ctx) {
  if (!canControlPlayback(ctx.participant)) {
    return respond(socket, ack, "Only the host and moderators can control playback");
  }
  return true;
}

function withHostPermission(socket, ack, ctx) {
  if (!isHost(ctx.participant)) {
    return respond(socket, ack, "Only the host can do that");
  }
  return true;
}

function respond(socket, ack, message) {
  if (ack) ack({ ok: false, message });
  else socket.emit(EVENTS.ERROR_EVENT, { message });
  return false;
}

function sanitizeUsername(raw) {
  const s = String(raw ?? "").trim();
  if (!s || s.length > 30) return null;
  return s;
}

function clampTime(t) {
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

module.exports = { registerRoomHandlers }; // socketRoomMap is internal
