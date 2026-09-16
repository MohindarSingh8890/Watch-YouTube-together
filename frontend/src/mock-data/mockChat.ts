import { ChatMessage } from '../types';

export const mockChat: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-1',
    senderName: 'AlexHost',
    senderRole: 'host',
    text: 'yo everyone ready? starting the movie in a sec',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'msg-2',
    senderId: 'user-2',
    senderName: 'SarahMod',
    senderRole: 'moderator',
    text: 'lets gooo 🍿',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'msg-3',
    senderId: 'user-3',
    senderName: 'Mike_42',
    senderRole: 'participant',
    text: 'wait can someone change the volume? i think its too low',
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'msg-4',
    senderId: 'user-1',
    senderName: 'AlexHost',
    senderRole: 'host',
    text: 'just adjust it on your end mike, its synced for everyone else',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'msg-5',
    senderId: 'user-4',
    senderName: 'JessWatches',
    senderRole: 'participant',
    text: 'this song is a classic ngl',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];
