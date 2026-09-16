import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { showToast } from '../common/Toast';
import { EVENTS } from '../../constants/socketEvents';
import { socket } from '../../services/socket';
import { beginRoomSession } from '../../services/roomSession';
import { RoomAck } from '../../types';

export default function CreateRoomCard() {
  const [displayName, setDisplayName] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!displayName.trim() || busy) return;
    setBusy(true);
    socket.emit(EVENTS.CREATE_ROOM, { username: displayName.trim() }, (res: RoomAck) => {
      setBusy(false);
      if (!res?.ok || !res.room) {
        showToast(res?.message || 'Could not create the room', 'error');
        return;
      }
      beginRoomSession(res);
      setCreatedCode(res.room.roomCode);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    showToast('Room code copied!', 'success');
  };

  const handleEnterRoom = () => {
    navigate(`/room/${createdCode}`);
  };

  if (createdCode) {
    return (
      <div className="bg-surface-200 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">Room Created!</h3>
        <p className="text-sm text-zinc-400 mb-4">Share this code with your friends</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-surface-300 rounded-xl px-4 py-3 font-mono text-xl text-center text-white tracking-widest">
            {createdCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="p-3 rounded-xl bg-surface-300 hover:bg-surface-400 text-zinc-300 transition-colors cursor-pointer"
          >
            <Copy size={18} />
          </button>
        </div>
        <Button onClick={handleEnterRoom} className="w-full">
          Enter Room
        </Button>
      </div>
    );
  }

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
          Create Room
        </Button>
      </div>
    </div>
  );
}