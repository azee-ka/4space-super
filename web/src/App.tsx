import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Spaces } from './pages/Spaces';
import { Chat } from './pages/Chat';

// Simple loading component
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0f9ff, #ffffff, #f0f9ff)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e0f2fe',
          borderTopColor: '#0ea5e9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Protected route wrapper
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  console.log('PrivateRoute check:', { user: user?.email, loading });
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public route wrapper (redirects to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  console.log('PublicRoute check:', { user: user?.email, loading });
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    console.log('User already logged in, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    console.log('🚀 App mounting, initializing auth...');
    initialize();
  }, []);

  useEffect(() => {
    console.log('Initialized status:', initialized);
  }, [initialized]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Spaces /></PrivateRoute>} />
        <Route path="/spaces/:id" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;