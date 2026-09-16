import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Shield, UserMinus, ArrowLeftRight } from 'lucide-react';
import { Participant } from '../../types';
import Avatar, { RoleIcon } from '../common/Avatar';
import Badge from '../common/Badge';

interface ParticipantItemProps {
  participant: Participant;
  isCurrentUser: boolean;
  isHost: boolean;
  onRoleChange: () => void;
  onRemove: () => void;
  onTransferHost: () => void;
}

export default function ParticipantItem({
  participant,
  isCurrentUser,
  isHost,
  onRoleChange,
  onRemove,
  onTransferHost,
}: ParticipantItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative group px-3 py-2 hover:bg-surface-300/50 rounded-xl mx-2 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar username={participant.username} size="sm" showStatus isOnline={participant.isOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${participant.isOnline ? 'text-zinc-100' : 'text-zinc-500'}`}>
              {participant.username}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] text-zinc-500">(you)</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <RoleIcon role={participant.role} size={11} />
            <span className="text-[10px] text-zinc-500 capitalize">{participant.role}</span>
          </div>
        </div>
        <Badge role={participant.role} />
        {isHost && !isCurrentUser && participant.role !== 'host' && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg hover:bg-surface-400 text-zinc-500 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface-200 border border-zinc-700 rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => { onRoleChange(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-surface-300 transition-colors cursor-pointer"
                >
                  <Shield size={14} className="text-accent-blue" />
                  Make Moderator
                </button>
                <button
                  onClick={() => { onTransferHost(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-surface-300 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight size={14} className="text-accent-gold" />
                  Transfer Host
                </button>
                <div className="h-px bg-zinc-700/50 my-1" />
                <button
                  onClick={() => { onRemove(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <UserMinus size={14} />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
