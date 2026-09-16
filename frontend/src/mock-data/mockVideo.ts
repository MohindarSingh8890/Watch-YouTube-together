import { VideoState } from '../types';

export const mockVideo: VideoState = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up - Rick Astley',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  isPlaying: true,
  currentTime: 45,
  duration: 213,
};

export const mockVideo2: VideoState = {
  videoId: 'jNQXAC9IVRw',
  title: 'Me at the zoo',
  thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  isPlaying: false,
  currentTime: 0,
  duration: 19,
};
