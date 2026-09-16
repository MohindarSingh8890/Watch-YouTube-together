import { Role } from '../../types';
import { Crown, Shield, Eye } from 'lucide-react';

interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  role?: Role;
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

const roleColors: Record<Role, string> = {
  host: 'bg-accent-gold/20 text-accent-gold',
  moderator: 'bg-accent-blue/20 text-accent-blue',
  participant: 'bg-surface-400 text-zinc-400',
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Avatar({ username, size = 'md', showStatus, isOnline }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold bg-surface-300 text-zinc-300 border border-zinc-600/50`}
      >
        {getInitials(username)}
      </div>
      {showStatus && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-200 ${
            isOnline ? 'bg-green-500' : 'bg-zinc-500'
          }`}
        />
      )}
    </div>
  );
}

export function RoleIcon({ role, size = 14 }: { role: Role; size?: number }) {
  if (role === 'host') return <Crown size={size} className="text-accent-gold" />;
  if (role === 'moderator') return <Shield size={size} className="text-accent-blue" />;
  return <Eye size={size} className="text-zinc-500" />;
}
