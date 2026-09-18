import { motion } from 'framer-motion';

interface ReactionsBarProps {
  onReact: (emoji: string) => void;
  reactions: { id: number; emoji: string }[];
}

const emojis = ['👍', '❤️', '😂', '🎉', '😮'];

export default function ReactionsBar({ onReact, reactions }: ReactionsBarProps) {
  return (
    <div className="relative flex items-center gap-1">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="px-2 py-1 rounded-full text-sm transition-all cursor-pointer bg-surface-300/50 border border-transparent hover:bg-surface-300 hover:border-zinc-700"
          title={`React ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      {reactions.map((reaction) => (
        <motion.div
          key={reaction.id}
          className="absolute bottom-full left-3 pointer-events-none text-xl"
          initial={{ opacity: 1, y: 0, x: 0 }}
          animate={{ opacity: 0, y: -48, x: -8 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {reaction.emoji}
        </motion.div>
      ))}
    </div>
  );
}
