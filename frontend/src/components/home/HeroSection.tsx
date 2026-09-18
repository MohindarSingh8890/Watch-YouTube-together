import { Play, Users, Zap } from 'lucide-react';

interface HeroSectionProps {
  compact?: boolean;
}

export default function HeroSection({ compact = false }: HeroSectionProps) {
  return (
    <section className={`text-center px-4 ${compact ? 'pt-6 md:pt-8' : 'pt-10 md:pt-14'}`}>
      <div className="inline-flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-full px-3.5 py-1 text-xs md:text-sm text-accent-red font-medium mb-4">
        <Zap size={13} />
        Real-time sync
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
        Watch YouTube <span className="text-accent-red">together</span>
      </h1>
      <p className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto">
        Create a room, invite your friends, and watch videos in perfect sync.
      </p>
      <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 mt-4">
        <span className="inline-flex items-center gap-1.5">
          <Play size={14} className="text-accent-red" />
          Synced playback
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} className="text-accent-blue" />
          Role-based control
        </span>
      </div>
    </section>
  );
}

