// web/src/config/routes.ts

import { lazy, type ComponentType } from 'react';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Spaces } from '../pages/Spaces';
import { SpaceView } from '../pages/SpaceView';
import { GeneralChat } from '../pages/GeneralChat';

// Lazy load heavy components
const ChatView = lazy(() => import('../pages/SpaceChatView').then(module => ({ default: module.SpaceChatView })));
const FilesView = lazy(() => import('../pages/FilesView').then(module => ({ default: module.FilesView })));
const NotesView = lazy(() => import('../pages/NotesView').then(module => ({ default: module.NotesView })));
const TasksView = lazy(() => import('../pages/TasksView').then(module => ({ default: module.TasksView })));
const CalendarView = lazy(() => import('../pages/CalendarView').then(module => ({ default: module.CalendarView })));
const BoardView = lazy(() => import('../pages/BoardView').then(module => ({ default: module.BoardView })));

export interface RouteConfig {
  path: string;
  element: ComponentType<any>;
  isProtected?: boolean;
  isPublicOnly?: boolean;
  isLazy?: boolean;
  loadingMessage?: string;
  children?: RouteConfig[];
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    element: Landing,
    isProtected: false,
  },
  {
    path: '/login',
    element: Login,
    isPublicOnly: true,
  },
  {
    path: '/signup',
    element: Signup,
    isPublicOnly: true,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: Spaces,
    isProtected: true,
  },
  {
    path: '/messages',
    element: GeneralChat,
    isProtected: true,
  },
  {
    path: '/spaces/:id',
    element: SpaceView,
    isProtected: true,
  },
];

// Space widget routes - these are dynamically generated
export const spaceWidgetRoutes: RouteConfig[] = [
  {
    path: '/spaces/:id/chat',
    element: ChatView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading secure chat...',
  },
  {
    path: '/spaces/:id/files',
    element: FilesView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading files...',
  },
  {
    path: '/spaces/:id/notes',
    element: NotesView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading notes...',
  },
  {
    path: '/spaces/:id/tasks',
    element: TasksView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading tasks...',
  },
  {
    path: '/spaces/:id/calendar',
    element: CalendarView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading calendar...',
  },
  {
    path: '/spaces/:id/board',
    element: BoardView,
    isProtected: true,
    isLazy: true,
    loadingMessage: 'Loading board...',
  },
];

// Combine all routes
export const allRoutes = [...publicRoutes, ...protectedRoutes, ...spaceWidgetRoutes];

// Helper to get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return allRoutes.find(route => route.path === path);
};

// Helper to check if route is protected
export const isProtectedRoute = (path: string): boolean => {
  const route = getRouteByPath(path);
  return route?.isProtected || false;
};

// Helper to check if route is public only
export const isPublicOnlyRoute = (path: string): boolean => {
  const route = getRouteByPath(path);
  return route?.isPublicOnly || false;
};