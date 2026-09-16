import { useState } from 'react';
import { motion } from 'framer-motion';

interface ReactionsBarProps {
  onReact: (emoji: string) => void;
}

const emojis = ['👍', '❤️', '😂', '🎉', '😮'];

export default function ReactionsBar({ onReact }: ReactionsBarProps) {
  const [floating, setFloating] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const handleReact = (emoji: string) => {
    const id = Date.now();
    const x = Math.random() * 40 - 20;
    setFloating((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.id !== id));
    }, 1000);

    onReact(emoji);
  };

  return (
    <div className="relative flex items-center gap-1">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="px-2 py-1 rounded-full text-sm transition-all cursor-pointer bg-surface-300/50 border border-transparent hover:bg-surface-300 hover:border-zinc-700"
          title={`React ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      {floating.map((f) => (
        <motion.div
          key={f.id}
          className="absolute bottom-full pointer-events-none text-xl"
          initial={{ opacity: 1, y: 0, x: f.x }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {f.emoji}
        </motion.div>
      ))}
    </div>
  );
}