import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import VideoPlayer from '../components/room/VideoPlayer';
import PlaybackControls from '../components/room/PlaybackControls';
import ChangeVideoInput from '../components/room/ChangeVideoInput';
import ParticipantsList from '../components/room/ParticipantsList';
import ChatBox from '../components/room/ChatBox';
import ReactionsBar from '../components/room/ReactionsBar';
import RoleAssignMenu from '../components/room/RoleAssignMenu';
import RemoveParticipantModal from '../components/room/RemoveParticipantModal';
import TransferHostModal from '../components/room/TransferHostModal';
import RoomCreatedModal from '../components/room/RoomCreatedModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { showToast } from '../components/common/Toast';
import { Participant, Role } from '../types';
import { useRoom } from '../hooks/useRoom';
import { Users, MessageCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

type MobileTab = 'participants' | 'chat';

function RoomLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-accent-red rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Connecting to room...</p>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    ready,
    currentUser,
    participants,
    video,
    currentTime,
    chat,
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
  } = useRoom();

  const code = roomCode || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('participants');
  const [createdModalOpen, setCreatedModalOpen] = useState(
    () => (location.state as { justCreated?: boolean } | null)?.justCreated === true
  );

  const [roleModalTarget, setRoleModalTarget] = useState<Participant | null>(null);
  const [removeModalTarget, setRemoveModalTarget] = useState<Participant | null>(null);
  const [transferModalTarget, setTransferModalTarget] = useState<Participant | null>(null);

  if (!ready || !currentUser) {
    return <RoomLoading />;
  }

  const closeCreatedModal = () => {
    setCreatedModalOpen(false);
    navigate(location.pathname, { replace: true });
  };

  const handleRoleChange = (participantId: string) => {
    const p = participants.find((pp) => pp.id === participantId);
    if (p) setRoleModalTarget(p);
  };

  const handleRemove = (participantId: string) => {
    const p = participants.find((pp) => pp.id === participantId);
    if (p) setRemoveModalTarget(p);
  };

  const handleTransferHost = (participantId: string) => {
    const p = participants.find((pp) => pp.id === participantId);
    if (p) setTransferModalTarget(p);
  };

  const confirmRoleChange = (role: Role) => {
    if (!roleModalTarget) return;
    assignRole(roleModalTarget.id, role);
    setRoleModalTarget(null);
  };

  const confirmRemove = () => {
    if (!removeModalTarget) return;
    removeParticipant(removeModalTarget.id);
    setRemoveModalTarget(null);
  };

  const confirmTransfer = () => {
    if (!transferModalTarget) return;
    transferHost(transferModalTarget.id);
    setTransferModalTarget(null);
  };

  const handleRequestControl = () => {
    requestControl();
    showToast('Control request sent to host', 'info');
  };

  return (
    <div className="h-screen flex flex-col bg-surface-50">
      <Navbar roomCode={code} userRole={currentUser.role} showBackToHome onLeave={leave} />

      <div className="flex flex-1 overflow-hidden">
        {/* main content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 md:p-6 flex-1">
            <div className="max-w-5xl mx-auto space-y-4">
              {/* video player */}
              <div className="relative">
                <VideoPlayer
                  video={video}
                  canControl={canControl}
                  onPlay={play}
                  onPause={pause}
                  onSeek={seek}
                  onTimeChange={onPlayerTime}
                />

                {/* remote reactions float over the video */}
                {floating.map((f) => (
                  <motion.div
                    key={f.id}
                    className="absolute bottom-8 left-1/2 pointer-events-none text-2xl"
                    initial={{ opacity: 1, y: 0, x: -12 }}
                    animate={{ opacity: 0, y: -80 }}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                  >
                    {f.emoji}
                  </motion.div>
                ))}
              </div>

              {/* controls row */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <PlaybackControls canControl={canControl} isPlaying={video.isPlaying} currentTime={currentTime} onSeek={seek} onPlay={play} onPause={pause} />
                <div className="flex-1 w-full">
                  <ChangeVideoInput canControl={canControl} onChangeVideo={changeVideo} />
                </div>
              </div>

              {/* reactions */}
              <div className="flex items-center justify-between">
                <ReactionsBar onReact={react} />
                {!canControl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRequestControl}
                    disabled={requestPending}
                    className="flex items-center gap-1.5"
                  >
                    <Lock size={14} />
                    {requestPending ? 'Request Sent...' : 'Request Control'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* desktop sidebar */}
        <div className="hidden md:flex">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-6 bg-surface-50 border-l border-zinc-800 flex items-center justify-center hover:bg-surface-200 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <ChevronRight size={14} className="text-zinc-500" /> : <ChevronLeft size={14} className="text-zinc-500" />}
          </button>
          <Sidebar isOpen={sidebarOpen}>
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex border-b border-zinc-700/50">
                <button
                  onClick={() => setMobileTab('participants')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    mobileTab === 'participants' ? 'text-zinc-100 border-b-2 border-accent-red' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Users size={15} />
                  People
                </button>
                <button
                  onClick={() => setMobileTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                    mobileTab === 'chat' ? 'text-zinc-100 border-b-2 border-accent-red' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <MessageCircle size={15} />
                  Chat
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {mobileTab === 'participants' ? (
                  <ParticipantsList
                    participants={participants}
                    currentUserId={currentUser.id}
                    isHost={isHost}
                    onRoleChange={handleRoleChange}
                    onRemove={handleRemove}
                    onTransferHost={handleTransferHost}
                  />
                ) : (
                  <ChatBox messages={chat} onSend={sendChat} />
                )}
              </div>
            </div>
          </Sidebar>
        </div>

        {/* mobile bottom panel */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-200 border-t border-zinc-800 z-30" style={{ height: '40vh' }}>
          <div className="flex border-b border-zinc-700/50">
            <button
              onClick={() => setMobileTab('participants')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                mobileTab === 'participants' ? 'text-zinc-100 border-b-2 border-accent-red' : 'text-zinc-500'
              }`}
            >
              <Users size={15} />
              People
            </button>
            <button
              onClick={() => setMobileTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                mobileTab === 'chat' ? 'text-zinc-100 border-b-2 border-accent-red' : 'text-zinc-500'
              }`}
            >
              <MessageCircle size={15} />
              Chat
            </button>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(40vh - 42px)' }}>
            {mobileTab === 'participants' ? (
              <ParticipantsList
                participants={participants}
                currentUserId={currentUser.id}
                isHost={isHost}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
                onTransferHost={handleTransferHost}
              />
            ) : (
              <ChatBox messages={chat} onSend={sendChat} />
            )}
          </div>
        </div>
      </div>

      {/* modals */}
      <Modal isOpen={!!roleModalTarget} onClose={() => setRoleModalTarget(null)} title="Assign Role">
        {roleModalTarget && (
          <RoleAssignMenu
            participantName={roleModalTarget.username}
            currentRole={roleModalTarget.role}
            onAssign={confirmRoleChange}
            onClose={() => setRoleModalTarget(null)}
          />
        )}
      </Modal>

      <RemoveParticipantModal
        isOpen={!!removeModalTarget}
        participantName={removeModalTarget?.username || ''}
        onConfirm={confirmRemove}
        onClose={() => setRemoveModalTarget(null)}
      />

      <TransferHostModal
        isOpen={!!transferModalTarget}
        participantName={transferModalTarget?.username || ''}
        onConfirm={confirmTransfer}
        onClose={() => setTransferModalTarget(null)}
      />

      <RoomCreatedModal
        isOpen={createdModalOpen}
        roomCode={code}
        onClose={closeCreatedModal}
      />
    </div>
  );
}