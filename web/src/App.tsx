import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Spaces } from './pages/Spaces';
import { SpaceView } from './pages/SpaceView';
import { ChatView } from './pages/ChatView';
import { FilesView } from './pages/FilesView';
import { NotesView } from './pages/NotesView';
import { TasksView } from './pages/TasksView';
import { CalendarView } from './pages/CalendarView';
import { BoardView } from './pages/BoardView';

function LoadingScreen() {
  return (
    <div className="h-screen gradient-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
          <svg className="absolute inset-0 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">Loading your universe...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Spaces /></PrivateRoute>} />
        
        {/* Space Routes */}
        <Route path="/spaces/:id" element={<PrivateRoute><SpaceView /></PrivateRoute>} />
        <Route path="/spaces/:id/chat" element={<PrivateRoute><ChatView /></PrivateRoute>} />
        <Route path="/spaces/:id/files" element={<PrivateRoute><FilesView /></PrivateRoute>} />
        <Route path="/spaces/:id/notes" element={<PrivateRoute><NotesView /></PrivateRoute>} />
        <Route path="/spaces/:id/tasks" element={<PrivateRoute><TasksView /></PrivateRoute>} />
        <Route path="/spaces/:id/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
        <Route path="/spaces/:id/board" element={<PrivateRoute><BoardView /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
