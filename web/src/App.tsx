import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { publicRoutes, protectedRoutes, spaceWidgetRoutes, type RouteConfig } from './config/routes';

function LoadingScreen() {
  return (
    <div className="h-screen gradient-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
          <svg className="absolute inset-0 animate-spin" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">Loading your universe...</p>
      </div>
    </div>
  );
}

function ComponentLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

function ErrorBoundaryFallback({ error }: { error: Error }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-8">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || ErrorBoundaryFallback;
      return <Fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // If user is authenticated, redirect to dashboard or intended destination
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Root redirect component
function RootRedirect() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingScreen />;
  }

  // If authenticated, go to dashboard
  // If not authenticated, go to landing page
  return <Navigate to={user ? '/dashboard' : '/landing'} replace />;
}

// Component to render a single route
function RouteRenderer({ route }: { route: RouteConfig }) {
  const Element = route.element;
  
  // Wrap in appropriate route guard
  if (route.isProtected) {
    return (
      <PrivateRoute>
        {route.isLazy ? (
          <ErrorBoundary>
            <Suspense fallback={<ComponentLoader message={route.loadingMessage} />}>
              <Element />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <Element />
        )}
      </PrivateRoute>
    );
  }
  
  if (route.isPublicOnly) {
    return (
      <PublicRoute>
        {route.isLazy ? (
          <ErrorBoundary>
            <Suspense fallback={<ComponentLoader message={route.loadingMessage} />}>
              <Element />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <Element />
        )}
      </PublicRoute>
    );
  }
  
  return <Element />;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Root route - smart redirect based on auth status */}
            <Route path="/" element={<RootRedirect />} />

            {/* Render all public routes */}
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<RouteRenderer route={route} />}
              />
            ))}

            {/* Render all protected routes */}
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<RouteRenderer route={route} />}
              />
            ))}

            {/* Render all space widget routes */}
            {spaceWidgetRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<RouteRenderer route={route} />}
              />
            ))}

            {/* Catch all - redirect based on auth status */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;