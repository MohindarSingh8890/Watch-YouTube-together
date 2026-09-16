import { useState } from 'react';
import { Link2 } from 'lucide-react';
import Button from '../common/Button';
import { showToast } from '../common/Toast';
import { parseVideoId } from '../../utils/youtube';

interface ChangeVideoInputProps {
  canControl: boolean;
  onChangeVideo: (videoId: string) => void;
}

export default function ChangeVideoInput({ canControl, onChangeVideo }: ChangeVideoInputProps) {
  const [url, setUrl] = useState('');

  const handleChange = () => {
    const id = parseVideoId(url);
    if (!id) {
      showToast('That does not look like a YouTube link', 'error');
      return;
    }
    onChangeVideo(id);
    setUrl('');
  };

  if (!canControl) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-300/50 text-zinc-500 text-sm">
        <Link2 size={14} />
        <span>Only host/mod can change videos</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Paste YouTube URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleChange()}
        className="flex-1 bg-surface-300 border border-zinc-600 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
      />
      <Button size="sm" onClick={handleChange} disabled={!url.trim()}>
        Change
      </Button>
    </div>
  );
}