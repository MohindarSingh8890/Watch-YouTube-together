export {}

interface YTPlayerLike {
  loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string | boolean): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead?: boolean): void
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  getVideoData(): { video_id: string }
  destroy(): void
}

interface YTIframeApi {
  Player: new (
    element: string | HTMLElement,
    options: {
      videoId?: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, unknown>
      events?: {
        onReady?: (event: { target: YTPlayerLike }) => void
        onStateChange?: (event: { data: number }) => void
      }
    }
  ) => YTPlayerLike
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
}

declare global {
  interface Window {
    YT?: YTIframeApi
    onYouTubeIframeAPIReady?: () => void
  }
}