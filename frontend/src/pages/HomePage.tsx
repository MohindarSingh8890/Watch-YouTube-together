import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import RoleSelection, { EntryRole } from '../components/home/RoleSelection';
import CreateRoomCard from '../components/home/CreateRoomCard';
import JoinRoomCard from '../components/home/JoinRoomCard';
import Footer from '../components/layout/Footer';

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
} as const;

export default function HomePage() {
  const [role, setRole] = useState<EntryRole | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection compact={role !== null} />
      <main className="flex-1 flex items-center px-4 py-6">
        <AnimatePresence mode="wait">
          {role === null ? (
            <motion.div key="choose-role" {...stepMotion} className="w-full max-w-2xl mx-auto">
              <RoleSelection onSelect={setRole} />
            </motion.div>
          ) : (
            <motion.div key={role} {...stepMotion} className="w-full max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setRole(null)}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-4 px-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red/50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Change role
              </button>
              {role === 'host' ? <CreateRoomCard /> : <JoinRoomCard />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

