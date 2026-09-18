import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom';
import { showToast } from '../components/common/Toast';
import { EVENTS } from '../constants/socketEvents';
import { socket } from '../services/socket';
import { beginRoomSession } from '../services/roomSession';
import { RoomAck } from '../types';

export default function JoinRoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(
    () => (location.state as { username?: string } | null)?.username ?? ''
  );
  const [joining, setJoining] = useState(false);
  const code = roomCode || '';


  const handleJoin = () => {
    if (!username.trim() || joining) return;
    setJoining(true);
    socket.emit(EVENTS.JOIN_ROOM, { roomCode: code, username: username.trim() }, (res: RoomAck) => {
      setJoining(false);
      if (!res?.ok || !res.room || !res.participant) {
        showToast(res?.message || 'Could not join the room', 'error');
        return;
      }
      beginRoomSession(res);
      navigate(`/${code}/${res.participant.role}`);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="bg-surface-200 border border-zinc-700/50 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center mx-auto mb-3">
              <User size={24} className="text-accent-blue" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Join Room</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Room code: <span className="font-mono text-zinc-300">{code}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Your display name"
              placeholder="What should we call you?"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <Button onClick={handleJoin} className="w-full" disabled={!username.trim() || joining}>
              {joining ? 'Joining...' : 'Join as Participant'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}