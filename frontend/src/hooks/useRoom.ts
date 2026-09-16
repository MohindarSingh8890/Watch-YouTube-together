import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENTS } from '../constants/socketEvents';
import { socket, mapChatMessage, mapParticipant } from '../services/socket';
import { clearRoomSession, getRoomSession } from '../services/roomSession';
import { showToast } from '../components/common/Toast';
import { ChatMessage, Participant, Role, VideoState } from '../types';

interface FloatingReaction {
  id: number;
  emoji: string;
}

type Ack = { ok: boolean; message?: string } | undefined;

export function useRoom() {
  const navigate = useNavigate();
  const session = getRoomSession();

  const [currentUser, setCurrentUser] = useState<Participant | null>(session?.participant ?? null);
  const [participants, setParticipants] = useState<Participant[]>(session?.room.participants ?? []);
  const [video, setVideo] = useState<VideoState>(
    session?.room.videoState ?? { videoId: '', isPlaying: false, currentTime: 0, duration: 0 }
  );
  const [chat, setChat] = useState<ChatMessage[]>(session?.chatHistory ?? []);
  const [hostId, setHostId] = useState<string | null>(session?.room.hostId ?? null);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [requestPending, setRequestPending] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // socket handlers read these refs so they never go stale
  const meRef = useRef(currentUser);
  const participantsRef = useRef(participants);
  const timeRef = useRef(video.currentTime);

  useEffect(() => { meRef.current = currentUser; }, [currentUser]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);

  useEffect(() => {
    if (!session) navigate('/');
  }, [session, navigate]);

  const syncParticipants = useCallback((rawList: any[]) => {
    const list = rawList.map(mapParticipant);
    setParticipants(list);
    const mappedMe = list.find((p) => p.id === meRef.current?.id);
    if (mappedMe) setCurrentUser(mappedMe);
  }, []);

  const addFloating = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    setFloating((prev) => [...prev, { id, emoji }]);
    setTimeout(() => setFloating((prev) => prev.filter((f) => f.id !== id)), 1400);
  }, []);

  useEffect(() => {
    if (!session) return;

    const onSync = (s: any) =>
      setVideo((prev) => ({
        ...prev,
        videoId: s.videoId ?? prev.videoId,
        isPlaying: s.isPlaying ?? prev.isPlaying,
        currentTime: s.currentTime ?? prev.currentTime,
      }));

    const onJoined = (d: any) => {
      syncParticipants(d.participants);
      showToast(`${d.username} joined`);
    };

    const onLeft = (d: any) => {
      syncParticipants(d.participants);
      showToast(`${d.username} left`);
    };

    const onRole = (d: any) => {
      syncParticipants(d.participants);
      if (d.userId === meRef.current?.id) {
        showToast(`You are now a ${d.role}`, 'success');
      }
    };

    const onRemoved = (d: any) => {
      if (d.userId === meRef.current?.id) {
        clearRoomSession();
        showToast('You were removed from the room', 'error');
        navigate('/');
        return;
      }
      syncParticipants(d.participants);
    };

    const onTransfer = (d: any) => {
      syncParticipants(d.participants);
      setHostId(d.newHostId);
      if (d.newHostId === meRef.current?.id) {
        showToast('You are now the host', 'success');
      }
    };

    const onRequest = (d: any) => {
      const role = meRef.current?.role;
      if (role === 'host' || role === 'moderator') {
        showToast(`${d.username} wants playback control`);
      }
    };

    const onChat = (d: any) => {
      setChat((prev) => [...prev, mapChatMessage(d, participantsRef.current)]);
    };

    const onReaction = (d: any) => addFloating(d.emoji);

    const onError = (d: any) => showToast(d.message, 'error');

    const onDisconnect = () => {
      clearRoomSession();
      showToast('Connection lost', 'error');
      navigate('/');
    };

    socket.on(EVENTS.SYNC_STATE, onSync);
    socket.on(EVENTS.USER_JOINED, onJoined);
    socket.on(EVENTS.USER_LEFT, onLeft);
    socket.on(EVENTS.ROLE_ASSIGNED, onRole);
    socket.on(EVENTS.PARTICIPANT_REMOVED, onRemoved);
    socket.on(EVENTS.HOST_TRANSFERRED, onTransfer);
    socket.on(EVENTS.CONTROL_REQUESTED, onRequest);
    socket.on(EVENTS.CHAT_MESSAGE, onChat);
    socket.on(EVENTS.REACTION, onReaction);
    socket.on(EVENTS.ERROR_EVENT, onError);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off(EVENTS.SYNC_STATE, onSync);
      socket.off(EVENTS.USER_JOINED, onJoined);
      socket.off(EVENTS.USER_LEFT, onLeft);
      socket.off(EVENTS.ROLE_ASSIGNED, onRole);
      socket.off(EVENTS.PARTICIPANT_REMOVED, onRemoved);
      socket.off(EVENTS.HOST_TRANSFERRED, onTransfer);
      socket.off(EVENTS.CONTROL_REQUESTED, onRequest);
      socket.off(EVENTS.CHAT_MESSAGE, onChat);
      socket.off(EVENTS.REACTION, onReaction);
      socket.off(EVENTS.ERROR_EVENT, onError);
      socket.off('disconnect', onDisconnect);
    };
  }, [session, navigate, syncParticipants, addFloating]);

  // ---- actions ----

  const onPlayerTime = useCallback((t: number) => {
    timeRef.current = t;
    setCurrentTime(t);
  }, []);

  const play = useCallback(() => {
    socket.emit(EVENTS.PLAY, { currentTime: timeRef.current });
    setVideo((prev) => ({ ...prev, isPlaying: true, currentTime: timeRef.current }));
  }, []);

  const pause = useCallback(() => {
    socket.emit(EVENTS.PAUSE, { currentTime: timeRef.current });
    setVideo((prev) => ({ ...prev, isPlaying: false, currentTime: timeRef.current }));
  }, []);

  const seek = useCallback((t: number) => {
    socket.emit(EVENTS.SEEK, { time: t });
    setVideo((prev) => ({ ...prev, currentTime: t }));
  }, []);

  const changeVideo = useCallback((videoId: string) => {
    socket.emit(EVENTS.CHANGE_VIDEO, { videoId }, (res: Ack) => {
      if (res && !res.ok) {
        showToast(res.message || 'Something went wrong', 'error');
        return;
      }
      setVideo((prev) => ({ ...prev, videoId, isPlaying: false, currentTime: 0 }));
    });
  }, []);

  const sendChat = useCallback((text: string) => {
    socket.emit(EVENTS.CHAT_MESSAGE, { text });
  }, []);

  const react = useCallback(
    (emoji: string) => {
      socket.emit(EVENTS.REACTION, { emoji });
      addFloating(emoji);
    },
    [addFloating]
  );

  const requestControl = useCallback(() => {
    socket.emit(EVENTS.REQUEST_CONTROL, {}, (res: Ack) => {
      if (res && !res.ok) showToast(res.message || 'Something went wrong', 'error');
    });
    setRequestPending(true);
    setTimeout(() => setRequestPending(false), 5000);
  }, []);

  const assignRole = useCallback((userId: string, role: Role) => {
    socket.emit(EVENTS.ASSIGN_ROLE, { userId, role }, (res: Ack) => {
      if (res && !res.ok) showToast(res.message || 'Something went wrong', 'error');
    });
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    socket.emit(EVENTS.REMOVE_PARTICIPANT, { userId }, (res: Ack) => {
      if (res && !res.ok) showToast(res.message || 'Something went wrong', 'error');
    });
  }, []);

  const transferHost = useCallback((userId: string) => {
    socket.emit(EVENTS.TRANSFER_HOST, { userId }, (res: Ack) => {
      if (res && !res.ok) showToast(res.message || 'Something went wrong', 'error');
    });
  }, []);

  const leave = useCallback(() => {
    socket.emit(EVENTS.LEAVE_ROOM);
    clearRoomSession();
    navigate('/');
  }, [navigate]);

  const role = currentUser?.role ?? null;
  const canControl = role === 'host' || role === 'moderator';
  const isHost = role === 'host';

  return {
    ready: !!currentUser,
    currentUser,
    participants,
    video,
    currentTime,
    chat,
    hostId,
    floating,
    requestPending,
    canControl,
    isHost,
    onPlayerTime,
    play,
    pause,
    seek,
    changeVideo,
    sendChat,
    react,
    requestControl,
    assignRole,
    removeParticipant,
    transferHost,
    leave,
  };
}