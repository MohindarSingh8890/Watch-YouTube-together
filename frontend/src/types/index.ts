export type Role = 'host' | 'moderator' | 'participant';

export interface Participant {
  id: string;
  username: string;
  avatarUrl?: string;
  role: Role;
  isOnline: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}

export interface VideoState {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  hostId: string;
  videoState: VideoState | null;
  participants: Participant[];
  createdAt: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

// ---- payloads coming off the socket ----

export interface RawParticipant {
  id: string;
  username: string;
  role: Role;
  joinedAt: number;
}

export interface RawRoomState {
  roomCode: string;
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  hostId: string;
  participants: RawParticipant[];
}

export interface RawChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  sentAt: number;
}

export interface RoomSession {
  username: string;
  roomCode: string;
  participant: Participant;
  room: Room;
  chatHistory: ChatMessage[];
}

export interface RoomAck {
  ok: boolean;
  message?: string;
  participant?: RawParticipant;
  room?: RawRoomState;
  chatHistory?: RawChatMessage[];
}