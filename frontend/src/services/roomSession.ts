import { RoomSession, RoomAck } from '../types';
import { mapChatMessage, mapParticipant } from './socket';

// in-memory only on purpose: a page refresh drops you back to the home screen,
// which is right because the backend has no way to recognise a reconnected socket
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
  return session;
}

export function getRoomSession() {
  return session;
}

export function clearRoomSession() {
  session = null;
}