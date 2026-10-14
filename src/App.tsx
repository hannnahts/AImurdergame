import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StartPage from './pages/StartPage';
import PhoneHome from './pages/PhoneHome';
import TabletLayout from './components/TabletLayout';
import HMLogs from './pages/homemind/HMLogs';
import HMAssistant from './pages/homemind/HMAssistant';
import HMDevices from './pages/homemind/HMDevices';
import HMGate from './pages/homemind/HMGate';
import ForumIndex from './pages/forum/ForumIndex';
import ForumPostDetail from './pages/forum/ForumPostDetail';
import AdminLogs from './pages/admin/AdminLogs';
import NotesHome from './pages/notes/NotesHome';
import Clues from './pages/notes/Clues';
import Todo from './pages/notes/Todo';
import PuzzlePage from './pages/case/PuzzlePage';
import SettingsHome from './pages/settings/SettingsHome';
import General from './pages/settings/General';
import About from './pages/settings/About';
import Developer from './pages/settings/Developer';
import WallPanel from './pages/panel/WallPanel';
import Ending from './pages/ending/Ending';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,#1a1d24_0%,#0a0b0e_70%)] text-slate-900 flex items-center justify-center font-sans md:p-4">
        <Routes>
          <Route path="/" element={<StartPage />} />

          {/* 平板:所有 App 都在设备外壳里 */}
          <Route path="/phone" element={<TabletLayout />}>
            <Route index element={<PhoneHome />} />
            <Route path="homemind">
              <Route index element={<HMGate><HMLogs /></HMGate>} />
              <Route path="ai" element={<HMGate><HMAssistant /></HMGate>} />
              <Route path="devices" element={<HMGate><HMDevices /></HMGate>} />
            </Route>
            <Route path="notes">
              <Route index element={<NotesHome />} />
              <Route path="clues" element={<Clues />} />
              <Route path="todo">
                <Route index element={<Todo />} />
                <Route path=":id" element={<PuzzlePage />} />
              </Route>
            </Route>
            <Route path="settings">
              <Route index element={<SettingsHome />} />
              <Route path="general" element={<General />} />
              <Route path="about" element={<About />} />
              <Route path="developer">
                <Route index element={<Developer />} />
                <Route path="console" element={<AdminLogs />} />
              </Route>
            </Route>
            <Route path="forum">
              <Route index element={<ForumIndex />} />
              <Route path="detail/:id" element={<ForumPostDetail />} />
            </Route>
          </Route>

          <Route path="/panel" element={<WallPanel />} />
          <Route path="/ending" element={<Ending />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
