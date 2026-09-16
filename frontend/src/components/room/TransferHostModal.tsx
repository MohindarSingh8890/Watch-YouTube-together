import Button from '../common/Button';
import Modal from '../common/Modal';

interface TransferHostModalProps {
  isOpen: boolean;
  participantName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function TransferHostModal({
  isOpen,
  participantName,
  onConfirm,
  onClose,
}: TransferHostModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Host">
      <div className="space-y-4">
        <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-xl p-3">
          <p className="text-sm text-accent-gold font-medium">Warning</p>
          <p className="text-xs text-zinc-400 mt-1">
            You will lose host privileges and become a moderator.
            This action cannot be undone from your side.
          </p>
        </div>
        <p className="text-sm text-zinc-400">
          Transfer host role to{' '}
          <span className="text-zinc-200 font-medium">{participantName}</span>?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => { onConfirm(); onClose(); }} className="bg-accent-gold hover:bg-yellow-600 text-black">
            Transfer Host
          </Button>
        </div>
      </div>
    </Modal>
  );
}
