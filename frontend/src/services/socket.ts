import { io } from 'socket.io-client';
import {
  Participant,
  RawParticipant,
  RawChatMessage,
  Role,
} from '../types';

// VITE_SOCKET_URL is optional; in dev the vite proxy forwards /socket.io
const url = import.meta.env.VITE_SOCKET_URL as string | undefined;

export const socket = url ? io(url) : io();

export function mapParticipant(raw: RawParticipant): Participant {
  return {
    id: raw.id,
    username: raw.username,
    role: raw.role,
    isOnline: true,
    joinedAt: new Date(raw.joinedAt).toISOString(),
  };
}

export function mapChatMessage(raw: RawChatMessage, participants: Participant[]): {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
} {
  const sender = participants.find((p) => p.id === raw.userId);
  return {
    id: raw.id,
    senderId: raw.userId,
    senderName: raw.username,
    senderRole: sender?.role ?? 'participant',
    text: raw.text,
    timestamp: new Date(raw.sentAt).toISOString(),
  };
}