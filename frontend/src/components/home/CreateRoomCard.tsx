import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { showToast } from '../common/Toast';
import { EVENTS } from '../../constants/socketEvents';
import { socket } from '../../services/socket';
import { beginRoomSession } from '../../services/roomSession';
import { RoomAck } from '../../types';

export default function CreateRoomCard() {
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!displayName.trim() || busy) return;
    setBusy(true);
    socket.emit(EVENTS.CREATE_ROOM, { username: displayName.trim() }, (res: RoomAck) => {
      if (!res?.ok || !res.room) {
        setBusy(false);
        showToast(res?.message || 'Could not create the room', 'error');
        return;
      }
      beginRoomSession(res);
      navigate(`/${res.room.roomCode}/host`, { state: { justCreated: true } });
    });
  };

  return (
    <div className="bg-surface-200 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-accent-red/10">
          <Plus size={20} className="text-accent-red" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">Create Room</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">Start a new watch party and invite friends</p>
      <div className="space-y-3">
        <Input
          label="Your display name"
          placeholder="e.g. AlexHost"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate} className="w-full" disabled={!displayName.trim() || busy}>
          {busy ? 'Creating...' : 'Create Room'}
        </Button>
      </div>
    </div>
  );
}
