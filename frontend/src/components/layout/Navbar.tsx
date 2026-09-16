import { Link } from 'react-router-dom';
import { Tv, LogOut } from 'lucide-react';
import Badge from '../common/Badge';
import { Role } from '../../types';

interface NavbarProps {
  roomCode?: string;
  roomName?: string;
  userRole?: Role;
  showBackToHome?: boolean;
  onLeave?: () => void;
}

export default function Navbar({ roomCode, roomName, userRole, showBackToHome, onLeave }: NavbarProps) {
  return (
    <nav className="h-14 bg-surface-50/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-zinc-100 font-bold text-lg hover:opacity-80 transition-opacity">
          <Tv size={22} className="text-accent-red" />
          <span className="hidden sm:inline">WatchParty</span>
        </Link>

        {roomCode && (
          <>
            <div className="w-px h-5 bg-zinc-700" />
            <div className="flex items-center gap-2">
              {roomName && <span className="text-sm text-zinc-400 hidden md:inline">{roomName}</span>}
              <button
                onClick={() => navigator.clipboard.writeText(roomCode)}
                className="text-xs font-mono bg-surface-300 px-2 py-1 rounded-md text-zinc-300 hover:bg-surface-400 transition-colors cursor-pointer"
                title="Copy room code"
              >
                {roomCode}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {userRole && <Badge role={userRole} />}
        {showBackToHome && onLeave && (
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Leave</span>
          </button>
        )}
        {showBackToHome && !onLeave && (
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Leave</span>
          </Link>
        )}
      </div>
    </nav>
  );
}