import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PlaybackControlsProps {
  canControl: boolean;
  isPlaying: boolean;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export default function PlaybackControls({
  canControl,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${!canControl ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        onClick={() => (isPlaying ? onPause() : onPlay())}
        className="p-2 rounded-xl bg-surface-300 hover:bg-surface-400 text-zinc-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
        disabled={!canControl}
        title={canControl ? (isPlaying ? 'Pause' : 'Play') : 'Only host/mod can control'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button
        onClick={() => canControl && onSeek(Math.max(0, currentTime - 10))}
        className="p-2 rounded-xl bg-surface-300 hover:bg-surface-400 text-zinc-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
        disabled={!canControl}
        title="Skip back 10s"
      >
        <SkipBack size={16} />
      </button>
      <button
        onClick={() => canControl && onSeek(currentTime + 10)}
        className="p-2 rounded-xl bg-surface-300 hover:bg-surface-400 text-zinc-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
        disabled={!canControl}
        title="Skip forward 10s"
      >
        <SkipForward size={16} />
      </button>
    </div>
  );
}