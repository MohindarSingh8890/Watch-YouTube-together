import Button from '../common/Button';
import Modal from '../common/Modal';

interface RemoveParticipantModalProps {
  isOpen: boolean;
  participantName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RemoveParticipantModal({
  isOpen,
  participantName,
  onConfirm,
  onClose,
}: RemoveParticipantModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Participant">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Are you sure you want to remove{' '}
          <span className="text-zinc-200 font-medium">{participantName}</span> from the room?
          They will lose access immediately.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => { onConfirm(); onClose(); }}>
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
}
