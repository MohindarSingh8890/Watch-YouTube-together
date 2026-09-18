import { Copy } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { showToast } from '../common/Toast';

interface RoomCreatedModalProps {
  isOpen: boolean;
  roomCode: string;
  onClose: () => void;
}

export default function RoomCreatedModal({ isOpen, roomCode, onClose }: RoomCreatedModalProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    showToast('Room code copied!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Created!">
      <p className="text-sm text-zinc-400 mb-5">Share this code with your friends</p>
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 bg-surface-300 rounded-xl px-3 py-3.5 font-mono text-2xl md:text-3xl text-center text-white tracking-widest select-all">
          {roomCode}
        </div>
        <button
          onClick={copyCode}
          title="Copy room code"
          className="shrink-0 p-3.5 rounded-xl bg-surface-300 hover:bg-surface-400 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <Copy size={18} />
        </button>
      </div>
      <Button onClick={onClose} className="w-full">
        Enter Room
      </Button>
    </Modal>
  );
}
