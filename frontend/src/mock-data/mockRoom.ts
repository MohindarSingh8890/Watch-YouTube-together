import { Room } from '../types';

export const mockRoom: Room = {
  id: 'room-001',
  code: 'XKCD42',
  name: 'Friday Night Movies',
  hostId: 'user-1',
  videoState: {
    videoId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    isPlaying: true,
    currentTime: 45,
    duration: 213,
  },
  participants: [],
  createdAt: new Date().toISOString(),
};
