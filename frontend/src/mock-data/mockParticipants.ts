import { Participant } from '../types';

export const mockParticipants: Participant[] = [
  {
    id: 'user-1',
    username: 'AlexHost',
    role: 'host',
    isOnline: true,
    joinedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-2',
    username: 'SarahMod',
    role: 'moderator',
    isOnline: true,
    joinedAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'user-3',
    username: 'Mike_42',
    role: 'participant',
    isOnline: true,
    joinedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'user-4',
    username: 'JessWatches',
    role: 'participant',
    isOnline: true,
    joinedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'user-5',
    username: 'DanTheMan',
    role: 'participant',
    isOnline: false,
    joinedAt: new Date(Date.now() - 600000).toISOString(),
  },
];
