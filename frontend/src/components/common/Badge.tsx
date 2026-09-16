import { Role } from '../../types';
import { Crown, Shield, Eye } from 'lucide-react';

interface BadgeProps {
  role: Role;
  size?: 'sm' | 'md';
}

const roleConfig: Record<Role, { label: string; styles: string; icon: React.ReactNode }> = {
  host: {
    label: 'Host',
    styles: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
    icon: <Crown size={12} />,
  },
  moderator: {
    label: 'Mod',
    styles: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
    icon: <Shield size={12} />,
  },
  participant: {
    label: 'Viewer',
    styles: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30',
    icon: <Eye size={12} />,
  },
};

export default function Badge({ role, size = 'sm' }: BadgeProps) {
  const config = roleConfig[role];
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.styles} ${sizeStyles}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
