import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';
import ChatMessage from './ChatMessage';

interface ChatBoxProps {
  messages: ChatMessageType[];
  onSend: (text: string) => void;
}

export default function ChatBox({ messages, onSend }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
        <MessageCircle size={16} className="text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              senderName={msg.senderName}
              senderRole={msg.senderRole}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-zinc-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-surface-300 border border-zinc-600 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-accent-red hover:bg-red-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
