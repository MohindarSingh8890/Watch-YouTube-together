import { Plus, LogIn, Play, Users, ArrowRight } from 'lucide-react';

export type EntryRole = 'host' | 'participant';

const roleCards = [
  {
    id: 'host' as const,
    title: 'Host',
    description: 'Create a new watch party and control the playback',
    icon: Plus,
    metaIcon: Play,
    meta: 'You control the video',
    iconWrap: 'bg-accent-red/10 text-accent-red',
    strip: 'via-accent-red/50',
    hoverBorder: 'hover:border-accent-red/40',
    focusRing: 'focus-visible:ring-accent-red/50',
    metaColor: 'text-red-400/80',
  },
  {
    id: 'participant' as const,
    title: 'Participant',
    description: 'Join an existing watch party with a room code',
    icon: LogIn,
    metaIcon: Users,
    meta: 'Watch along with everyone',
    iconWrap: 'bg-accent-blue/10 text-accent-blue',
    strip: 'via-accent-blue/50',
    hoverBorder: 'hover:border-accent-blue/40',
    focusRing: 'focus-visible:ring-accent-blue/50',
    metaColor: 'text-blue-400/80',
  },
];

interface RoleSelectionProps {
  onSelect: (role: EntryRole) => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
        Get started
      </p>
      <h2 className="text-center text-xl md:text-2xl font-semibold text-zinc-100 mb-5">
        How do you want to enter?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {roleCards.map((card) => {
          const Icon = card.icon;
          const MetaIcon = card.metaIcon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(card.id)}
              className={`group relative w-full text-left bg-surface-200 border border-zinc-700/50 rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 ${card.hoverBorder} ${card.focusRing} cursor-pointer`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${card.strip}`}
              />
              <div className="flex items-center gap-3.5">
                <div className={`shrink-0 p-2.5 rounded-xl ${card.iconWrap}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-100 leading-snug">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-snug">{card.description}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="ml-auto shrink-0 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all duration-200"
                />
              </div>
              <div
                className={`flex items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-700/50 text-xs font-medium ${card.metaColor}`}
              >
                <MetaIcon size={13} />
                {card.meta}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

