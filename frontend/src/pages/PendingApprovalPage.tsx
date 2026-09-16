import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-accent-gold" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Waiting for approval</h1>
        <p className="text-zinc-500 mb-6">
          The host needs to approve your request to join the room.
          Hang tight — you'll be let in shortly.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
