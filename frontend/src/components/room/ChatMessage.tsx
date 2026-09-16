import { Role } from '../../types';
import Badge from '../common/Badge';

interface ChatMessageProps {
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ senderName, senderRole, text, timestamp }: ChatMessageProps) {
  return (
    <div className="px-3 py-2 hover:bg-surface-300/30 rounded-lg transition-colors group">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-sm font-medium text-zinc-200">{senderName}</span>
        <Badge role={senderRole} size="sm" />
        <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTimestamp(timestamp)}
        </span>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
    </div>
  );
}
