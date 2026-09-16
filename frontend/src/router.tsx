import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomCode" element={<RoomPage />} />
        <Route path="/join/:roomCode" element={<JoinRoomPage />} />
        <Route path="/pending" element={<PendingApprovalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
