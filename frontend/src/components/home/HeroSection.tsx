import { Play, Users, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center py-16 md:py-24 px-4">
      <div className="inline-flex items-center gap-2 bg-accent-red/10 border border-accent-red/20 rounded-full px-4 py-1.5 text-sm text-accent-red font-medium mb-6">
        <Zap size={14} />
        Real-time sync
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
        Watch YouTube
        <br />
        <span className="text-accent-red">together</span>
      </h1>
      <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
        Create a room, invite your friends, and watch videos in perfect sync.
        Play, pause, and seek — everyone stays on the same page.
      </p>
      <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-accent-red" />
          Synced playback
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-accent-blue" />
          Role-based control
        </div>
      </div>
    </section>
  );
}
