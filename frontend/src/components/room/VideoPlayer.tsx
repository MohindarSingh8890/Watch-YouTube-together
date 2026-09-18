import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { VideoState } from '../../types';
import { loadYouTubeApi } from '../../utils/youtube';

interface VideoPlayerProps {
  video: VideoState;
  canControl: boolean;
  onPlay: (t: number) => void;
  onPause: (t: number) => void;
  onSeek: (t: number) => void;
  onTimeChange: (t: number) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ video, canControl, onPlay, onPause, onSeek, onTimeChange }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerBoxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const suppressUntilRef = useRef(0);
  const lastVideoIdRef = useRef('');

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [now, setNow] = useState(video.currentTime);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // keep latest props available to the yt event callbacks
  const cbRef = useRef({ video, canControl, onPlay, onPause, onSeek, onTimeChange });
  cbRef.current = { video, canControl, onPlay, onPause, onSeek, onTimeChange };

  const applyRemote = () => {
    const p = playerRef.current;
    const v = cbRef.current.video;
    if (!p || !v.videoId) return;

    suppressUntilRef.current = Date.now() + 700;
    if (lastVideoIdRef.current !== v.videoId) {
      lastVideoIdRef.current = v.videoId;
      p.loadVideoById(v.videoId, v.currentTime || 0, v.isPlaying);
      return;
    }
    p.seekTo(v.currentTime || 0, true);
    if (v.isPlaying) p.playVideo();
    else p.pauseVideo();
  };

  // create the player lazily the first time a video id shows up
  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || playerRef.current) return;
      if (!cbRef.current.video.videoId) return;

      const player: any = new window.YT!.Player(containerRef.current!, {
        videoId: cbRef.current.video.videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            playerRef.current = player;
            setDuration(player.getDuration() || 0);
            applyRemote();
            setPlaying(player.getPlayerState() === 1);
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1);
            if (Date.now() < suppressUntilRef.current) return;

            const t = player.getCurrentTime() || 0;
            if (e.data === 1) {
              cbRef.current.onPlay(t);
            } else if (e.data === 2) {
              cbRef.current.onPause(t);
            } else if (e.data === 0 && cbRef.current.canControl) {
              // a video that ran to the end isn't someone hitting pause
              cbRef.current.onPause(0);
            }
          },
        },
      });
      lastVideoIdRef.current = cbRef.current.video.videoId;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.videoId]);

  // follow the server-side state (sync_state)
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !video.videoId) return;

    const currentId = p.getVideoData?.().video_id || lastVideoIdRef.current;
    if (currentId !== video.videoId) {
      lastVideoIdRef.current = video.videoId;
      suppressUntilRef.current = Date.now() + 700;
      p.loadVideoById(video.videoId, video.currentTime || 0, video.isPlaying);
      return;
    }

    const state = p.getPlayerState();
    const playingNow = state === 1;
    const timeDiff = Math.abs(p.getCurrentTime() - (video.currentTime || 0));

    if (timeDiff > 0.5) {
      suppressUntilRef.current = Date.now() + 250;
      p.seekTo(video.currentTime || 0, true);
    }
    if (video.isPlaying && !playingNow) {
      suppressUntilRef.current = Date.now() + 600;
      if (state === 0) p.seekTo(0, true);
      p.playVideo();
    } else if (!video.isPlaying && playingNow) {
      suppressUntilRef.current = Date.now() + 400;
      p.pauseVideo();
    }
  }, [video.videoId, video.isPlaying, video.currentTime]);

  // clock for the seek bar
  useEffect(() => {
    const timer = setInterval(() => {
      const p = playerRef.current;
      if (!p || !p.getCurrentTime) return;
      const t = p.getCurrentTime() || 0;
      const d = p.getDuration() || 0;
      setNow(t);
      if (d && d !== duration) setDuration(d);
      cbRef.current.onTimeChange(t);
    }, 250);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const resizePlayer = () => {
      const player = playerRef.current;
      const playerBox = playerBoxRef.current;
      if (!player?.setSize || !playerBox) return;

      if (document.fullscreenElement === playerBox) {
        player.setSize(window.innerWidth, window.innerHeight);
      } else {
        const width = playerBox.clientWidth;
        if (width) player.setSize(width, Math.round(width * 9 / 16));
      }
    };

    const onChange = () => {
      const fullscreen = document.fullscreenElement === playerBoxRef.current;
      setIsFullscreen(fullscreen);
      requestAnimationFrame(resizePlayer);
    };

    document.addEventListener('fullscreenchange', onChange);
    window.addEventListener('resize', resizePlayer);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      window.removeEventListener('resize', resizePlayer);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerBoxRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) player.unMute();
    else player.mute();
    setMuted(!muted);
  };

  const togglePlay = () => {
    if (!cbRef.current.canControl || !playerRef.current) return;
    const p = playerRef.current;
    const playingNow = p.getPlayerState() === 1;
    suppressUntilRef.current = Date.now() + 500;
    if (playingNow) {
      p.pauseVideo();
      cbRef.current.onPause(p.getCurrentTime() || 0);
    } else {
      p.playVideo();
      cbRef.current.onPlay(p.getCurrentTime() || 0);
    }
  };

  const onSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cbRef.current.canControl || !playerRef.current) return;
    const p = playerRef.current;
    const d = p.getDuration() || duration;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * d;
    p.seekTo(t, true);
    cbRef.current.onSeek(t);
  };

  const progressPct = duration > 0 ? (now / duration) * 100 : 0;

  if (!video.videoId) {
    return (
      <div className="relative w-full bg-black rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-2">
            {canControl ? 'Looking good — load a video below to start' : 'Waiting for the host to put a video on'}
          </p>
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-accent-red rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div ref={playerBoxRef} className="watch-player relative w-full bg-black rounded-2xl overflow-hidden group">
      {/* the yt api swaps this div for the iframe */}
      <div ref={containerRef} className="relative aspect-video w-full" />

      {/* swallows clicks so the yt iframe can't toggle playback on its own */}
      {!canControl && <div className="absolute inset-0" />}

      {!canControl && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          View only
        </div>
      )}

      {/* big play button */}
      <button
        onClick={togglePlay}
        disabled={!canControl}
        className={`absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all ${
          canControl ? 'cursor-pointer hover:bg-white/30 hover:scale-105' : 'opacity-40 cursor-not-allowed'
        }`}
      >
        {playing ? (
          <Pause size={28} className="text-white" fill="white" />
        ) : (
          <Play size={28} className="text-white ml-1" fill="white" />
        )}
      </button>

      {/* bottom overlay controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-3 px-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <div
          className={`w-full h-1.5 bg-zinc-700 rounded-full mb-3 ${
            canControl ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none'
          }`}
          onClick={canControl ? onSeekBarClick : undefined}
        >
          <div className="h-full bg-accent-red rounded-full relative" style={{ width: `${progressPct}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-red rounded-full shadow-md" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!canControl}
              className={`transition-colors ${
                canControl ? 'text-white hover:text-accent-red cursor-pointer' : 'text-white opacity-40 cursor-not-allowed'
              }`}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              {formatTime(now)} / {formatTime(duration)}
            </span>
          </div>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
