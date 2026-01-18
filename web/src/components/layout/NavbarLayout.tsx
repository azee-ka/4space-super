// web/src/components/layout/NavbarLayout.tsx
// Layout component that handles navbar visibility across all pages

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../navbar/Navbar';
import { useNavbarStore } from '../../store/navbarStore';

interface NavbarLayoutProps {
  children: ReactNode;
}

// Routes where navbar can be toggled (hidden by default, user can show)
const TOGGLEABLE_NAVBAR_ROUTES = [
  '/spaces/:id/chat',
  '/messages',
];

// Routes where navbar is always hidden
const HIDDEN_NAVBAR_ROUTES: string[] = [
  // Add any routes where navbar should never appear
];

// Check if current path matches a route pattern
function matchesRoute(pathname: string, pattern: string): boolean {
  // Convert route pattern to regex (handle :id params)
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
    .replace(/\//g, '\\/'); // Escape slashes
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

export function NavbarLayout({ children }: NavbarLayoutProps) {
  const location = useLocation();
  const { showNavbar } = useNavbarStore();

  // Check if navbar should be hidden
  const isHiddenRoute = HIDDEN_NAVBAR_ROUTES.some(route =>
    matchesRoute(location.pathname, route)
  );

  // Check if this is a toggleable route
  const isToggleableRoute = TOGGLEABLE_NAVBAR_ROUTES.some(route =>
    matchesRoute(location.pathname, route)
  );

  // Determine navbar visibility
  // - Hidden routes: never show
  // - Toggleable routes: respect store state
  // - Other routes: always show
  const shouldShowNavbar = !isHiddenRoute && (isToggleableRoute ? showNavbar : true);

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden relative">
      {/* Navbar - floats above content */}
      <AnimatePresence>
        {shouldShowNavbar && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area - uses margin instead of padding for cleaner spacing */}
      <motion.div
        className="flex-1 overflow-hidden"
        animate={{ marginTop: shouldShowNavbar ? 70 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Export helper for pages that want toggle functionality
export function useNavbarToggle() {
  const { showNavbar, toggleNavbar } = useNavbarStore();
  return { showNavbar, toggleNavbar };
}
