import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import { getSavedSession } from './services/roomSession';

function RoomRedirect() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const code = (roomCode || '').toUpperCase();

  useEffect(() => {
    const saved = getSavedSession();
    if (saved && saved.roomCode === code) navigate(`/${code}/participant`, { replace: true });
    else navigate(`/join/${code}`, { replace: true });
  }, [code, navigate]);

  return null;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join/:roomCode" element={<JoinRoomPage />} />
        <Route path="/pending" element={<PendingApprovalPage />} />
        <Route path="/room/:roomCode" element={<RoomRedirect />} />
        <Route path="/:roomCode/:position" element={<RoomPage />} />
        <Route path="/:roomCode" element={<RoomRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
