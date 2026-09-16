import { Participant } from '../../types';
import ParticipantItem from './ParticipantItem';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  onRoleChange: (participantId: string) => void;
  onRemove: (participantId: string) => void;
  onTransferHost: (participantId: string) => void;
}

export default function ParticipantsList({
  participants,
  currentUserId,
  isHost,
  onRoleChange,
  onRemove,
  onTransferHost,
}: ParticipantsListProps) {
  const sorted = [...participants].sort((a, b) => {
    const order = { host: 0, moderator: 1, participant: 2 };
    return order[a.role] - order[b.role];
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-700/50">
        <h3 className="text-sm font-semibold text-zinc-200">
          Participants ({participants.filter((p) => p.isOnline).length}/{participants.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sorted.map((p) => (
          <ParticipantItem
            key={p.id}
            participant={p}
            isCurrentUser={p.id === currentUserId}
            isHost={isHost}
            onRoleChange={() => onRoleChange(p.id)}
            onRemove={() => onRemove(p.id)}
            onTransferHost={() => onTransferHost(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
