import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-surface-300 flex items-center justify-center mx-auto mb-4">
          <SearchX size={32} className="text-zinc-500" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Room not found</h1>
        <p className="text-zinc-500 mb-6">
          The room you're looking for doesn't exist or the code is invalid.
          Double-check the link and try again.
        </p>
        <Link to="/">
          <Button variant="secondary" className="inline-flex items-center gap-2">
            <Home size={16} />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
