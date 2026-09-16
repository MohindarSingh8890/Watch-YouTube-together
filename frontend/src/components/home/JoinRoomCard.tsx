import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { showToast } from '../common/Toast';

export default function JoinRoomCard() {
  const [roomCode, setRoomCode] = useState('');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase();
    if (!code || checking) return;

    setChecking(true);
    try {
      const res = await fetch(`/api/rooms/${code}/exists`);
      const data = await res.json();
      if (!data.exists) {
        showToast('No room with that code', 'error');
        return;
      }
    } catch {
      showToast('Server unreachable, try again', 'error');
      return;
    } finally {
      setChecking(false);
    }

    navigate(`/join/${code}`);
  };

  return (
    <div className="bg-surface-200 border border-zinc-700/50 rounded-2xl p-6 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-accent-blue/10">
          <LogIn size={20} className="text-accent-blue" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">Join Room</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">Enter a room code to join an existing party</p>
      <div className="space-y-3">
        <Input
          placeholder="Room code (e.g. XKCD42)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="font-mono tracking-wider text-center"
        />
        <Button variant="secondary" onClick={handleJoin} className="w-full" disabled={!roomCode.trim() || checking}>
          {checking ? 'Checking...' : 'Join Room'}
        </Button>
      </div>
    </div>
  );
}