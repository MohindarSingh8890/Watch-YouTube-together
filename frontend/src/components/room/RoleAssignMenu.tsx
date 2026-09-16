import { useState } from 'react';
import { Role } from '../../types';
import Button from '../common/Button';

interface RoleAssignMenuProps {
  participantName: string;
  currentRole: Role;
  onAssign: (role: Role) => void;
  onClose: () => void;
}

export default function RoleAssignMenu({ participantName, currentRole, onAssign, onClose }: RoleAssignMenuProps) {
  const [selected, setSelected] = useState<Role>(currentRole);

  const roles: { value: Role; label: string; desc: string }[] = [
    { value: 'moderator', label: 'Moderator', desc: 'Can control playback and manage participants' },
    { value: 'participant', label: 'Participant', desc: 'View only, no playback control' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Assign a new role to <span className="text-zinc-200 font-medium">{participantName}</span>
      </p>
      <div className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => setSelected(role.value)}
            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
              selected === role.value
                ? 'border-accent-blue bg-accent-blue/10'
                : 'border-zinc-700 bg-surface-300 hover:bg-surface-400'
            }`}
          >
            <div className="text-sm font-medium text-zinc-100">{role.label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{role.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => { onAssign(selected); onClose(); }}>
          Assign Role
        </Button>
      </div>
    </div>
  );
}
