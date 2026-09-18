import { RoomSession, RoomAck } from '../types';
import { mapChatMessage, mapParticipant } from './socket';

const STORAGE_KEY = 'watch-party-session';

export interface SavedSession {
  username: string;
  roomCode: string;
  participantId: string;
}

let session: RoomSession | null = null;

export function beginRoomSession(ack: RoomAck): RoomSession | null {
  if (!ack?.participant || !ack.room) return null;

  const participants = ack.room.participants.map(mapParticipant);
  const me = mapParticipant(ack.participant);

  session = {
    username: me.username,
    roomCode: ack.room.roomCode,
    participant: me,
    room: {
      id: ack.room.roomCode,
      code: ack.room.roomCode,
      name: '',
      hostId: ack.room.hostId,
      videoState: {
        videoId: ack.room.videoId ?? '',
        isPlaying: ack.room.isPlaying,
        currentTime: ack.room.currentTime,
        duration: 0,
      },
      participants,
      createdAt: new Date().toISOString(),
    },
    chatHistory: (ack.chatHistory ?? []).map((m) => mapChatMessage(m, participants)),
  };
  save(session);
  return session;
}

export function getRoomSession() {
  return session;
}

export function clearRoomSession() {
  session = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function getSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (
      typeof saved?.username === 'string' &&
      typeof saved?.roomCode === 'string' &&
      typeof saved?.participantId === 'string' &&
      saved.username &&
      saved.roomCode &&
      saved.participantId
    ) {
      return saved;
    }
  } catch {}
  return null;
}

function save(next: RoomSession) {
  const saved: SavedSession = {
    username: next.username,
    roomCode: next.roomCode,
    participantId: next.participant.id,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {}
}