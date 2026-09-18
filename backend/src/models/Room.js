const { v4: uuidv4 } = require("uuid");
const { ROLES } = require("../constants/roles");
const Participant = require("./Participant");

const MAX_CHAT = 100;

class Room {
  constructor(host) {
    this.code = null; // assigned by roomService
    this.participants = new Map(); // userId -> Participant
    this.videoId = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.updatedAt = Date.now();
    this.chatHistory = [];
    this.pendingControlRequests = new Set(); // userIds
    this.hostId = host.id;

    host.role = ROLES.HOST;
    this.participants.set(host.id, host);
  }

  addParticipant(participant) {
    participant.role = ROLES.PARTICIPANT;
    this.participants.set(participant.id, participant);
  }

  removeParticipant(participantId) {
    const removed = this.participants.get(participantId);
    this.participants.delete(participantId);
    this.pendingControlRequests.delete(participantId);
    return removed;
  }

  setPlayback({ videoId, isPlaying, currentTime }) {
    if (videoId !== undefined) this.videoId = videoId;
    if (isPlaying !== undefined) this.isPlaying = isPlaying;
    if (currentTime !== undefined) this.currentTime = currentTime;
    this.updatedAt = Date.now();
  }

  playbackState() {
    const elapsed = this.isPlaying ? (Date.now() - this.updatedAt) / 1000 : 0;
    return {
      videoId: this.videoId,
      isPlaying: this.isPlaying,
      currentTime: Math.max(0, Math.round((this.currentTime + elapsed) * 100) / 100),
    };
  }

  setRole(participantId, role) {
    const p = this.participants.get(participantId);
    if (!p) return null;
    p.role = role;
    return p;
  }

  transferHost(newHostId) {
    const oldHost = this.participants.get(this.hostId);
    const newHost = this.participants.get(newHostId);
    if (!newHost) return null;
    if (oldHost) oldHost.role = ROLES.MODERATOR;
    newHost.role = ROLES.HOST;
    this.hostId = newHostId;
    return newHost;
  }

  // pick the participant who joined earliest to take over as host
  pickNextHost() {
    let oldest = null;
    for (const p of this.participants.values()) {
      if (p.id === this.hostId) continue;
      if (!oldest || p.joinedAt < oldest.joinedAt) oldest = p;
    }
    return oldest;
  }

  pushChat(message) {
    const entry = { id: uuidv4(), ...message };
    this.chatHistory.push(entry);
    if (this.chatHistory.length > MAX_CHAT) {
      this.chatHistory.splice(0, this.chatHistory.length - MAX_CHAT);
    }
    return entry;
  }

  participantsList() {
    return Array.from(this.participants.values()).map((p) => p.toJSON());
  }

  getPublicState() {
    return {
      roomCode: this.code,
      ...this.playbackState(),
      hostId: this.hostId,
      participants: this.participantsList(),
    };
  }

  toStorage() {
    return {
      code: this.code,
      hostId: this.hostId,
      videoId: this.videoId,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      updatedAt: this.updatedAt,
      chatHistory: this.chatHistory,
      pendingControlRequests: Array.from(this.pendingControlRequests),
      participants: Array.from(this.participants.values()).map((p) => p.toJSON()),
    };
  }

  static fromStorage(data) {
    const raw = Array.isArray(data.participants) ? data.participants : [];
    const hostData = raw.find((p) => p.id === data.hostId) || raw[0];
    if (!hostData) return null;

    const host = Participant.fromJSON(hostData);
    if (!host) return null;

    const room = new Room(host);
    room.code = typeof data.code === "string" ? data.code : host.id;
    room.hostId = host.id;
    room.videoId = typeof data.videoId === "string" ? data.videoId : null;
    room.isPlaying = !!data.isPlaying;
    room.currentTime = Number.isFinite(data.currentTime) ? data.currentTime : 0;
    room.updatedAt = Number.isFinite(data.updatedAt) ? data.updatedAt : Date.now();
    room.chatHistory = Array.isArray(data.chatHistory) ? data.chatHistory : [];
    room.pendingControlRequests = new Set(
      Array.isArray(data.pendingControlRequests) ? data.pendingControlRequests : []
    );

    for (const pdata of raw) {
      if (pdata.id === host.id) continue;
      const p = Participant.fromJSON(pdata);
      if (p) room.participants.set(p.id, p);
    }
    room.participants.get(host.id).role = ROLES.HOST;
    return room;
  }
}

module.exports = Room;
