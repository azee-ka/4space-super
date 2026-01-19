// Advanced Chat Interface with Island-Based Sidebars
// web/src/pages/SpaceChatView.tsx

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHashtag, faRocket,
  faCog, faPhone, faVideo,
  faUsers, faThumbtack, faSearch, faExclamationTriangle, faHouse,
  faBookmark, faStar, faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavbarStore } from '../store/navbarStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useChatSettingsStore } from '../store/chatSettingsStore';
import { getBackgroundStyle, getAmbientBackgroundStyle } from '../utils/themeUtils';
import { useSpace, useSpaceMembers } from '../hooks/useSpaces';
import {
  useSpaceRooms,
  useRoom,
  useRoomMessages,
  useRoomMembers,
  useSendMessage,
  useDeleteMessage,
  usePinMessage,
  usePinnedMessages,
  useAddReaction,
  useRemoveReaction,
  useMarkRoomAsRead,
  useBookmarkMessage,
  useCreateRoom,
} from '../hooks/useMessages';
import { useRealtimeChat } from '../hooks/useRealtime';
import { MessagesList } from '../components/spaces/chat/centerPanel/MessagesList';
import { MessageInput } from '../components/spaces/chat/centerPanel/MessageInput';
import { PinnedBanner } from '../components/spaces/chat/centerPanel/PinnedBanner';
import { RoomSearchPanel } from '../components/spaces/chat/rightPanel/RoomSearchPanel';
import { PinnedMessagesPanel } from '../components/spaces/chat/rightPanel/PinnedMessagesPanel';
import { KeptMessagesPanel } from '../components/spaces/chat/rightPanel/KeptMessagesPanel';
import { BookmarkedMessagesPanel } from '../components/spaces/chat/rightPanel/BookmarkedMessagesPanel';
import { RoomCallPanel } from '../components/spaces/chat/rightPanel/RoomCallPanel';
import { CreateRoomModal } from '../components/spaces/chat/leftPanel/CreateRoomModal';
import { LeftSidebar } from '../components/spaces/chat/leftPanel/LeftSidebar';
import { RightSidebar } from '../components/spaces/chat/rightPanel/RightSidebar';
import { RoomMembersPanel } from '../components/spaces/chat/rightPanel/RoomMembersPanel';
import type { Message as MessageType } from '@4space/shared/src/services/messages.service';
import { useUpdateMessage } from '../hooks/useMessages';
import { useShouldUseMirroredBackground, useBackgroundSizing } from '../hooks/useWindowSize';
import { useChatSettingsSync } from '../hooks/useChatSettingsSync';
import { useRoomSettings } from '../hooks/useSettings';
import { DEFAULT_ROOM_SETTINGS } from '@4space/shared/src/types/chatSettings';
import { hasPermission, type MemberRole } from '@4space/shared/src/types/permissions';
import { getMessageRetentionExpiresAt, getMessageRetentionMs } from '@4space/shared/src/utils/messageRetention';

type LeftSidebarTab = 'rooms' | 'metrics' | 'productivity' | 'reminders' | 'notes';
type RightSidebarTab = 'settings' | 'metadata' | 'metrics' | 'media' | 'links' | 'customization';
type RightPanelView = 'home' | 'members' | 'search' | 'pin' | 'keep' | 'saved' | 'call';

export function SpaceChatView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showNavbar, toggleNavbar } = useNavbarStore();
  useChatSettingsSync();

  // Handle missing space ID
  if (!spaceId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Space Not Found</h2>
          <p className="text-gray-400 mb-4">Please select a valid space to continue.</p>
          <button
            onClick={() => navigate('/spaces')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            Go to Spaces
          </button>
        </div>
      </div>
    );
  }

  // TypeScript doesn't understand that spaceId is defined after the early return above
  const chatSettings = useChatSettingsStore();
  const ambientLighting = useChatSettingsStore((state) => state.ambientLighting);
  const ambientIntensity = useChatSettingsStore((state) => state.ambientIntensity);
  const {
    showAvatars,
    showUsernames,
    showTimestamps,
    showReadReceipts,
    showMessageStatus,
    autoScrollToBottom,
    groupMessages,
    messageAnimations,
    reduceAnimations,
    pinImportantMessages,
    showTypingIndicator,
  } = useChatSettingsStore();

  // Determine if we should use mirrored backgrounds for seamless stitching
  const shouldUseMirror = useShouldUseMirroredBackground();
  const { tileCount, imageHeight } = useBackgroundSizing();

  // Helper function to get accent color focus classes
  const getAccentFocusClass = (accentColor: string) => {
    const colorMap: Record<string, string> = {
      'purple': 'focus:border-purple-400/70 focus:ring-purple-400/30',
      'blue': 'focus:border-blue-400/70 focus:ring-blue-400/30',
      'cyan': 'focus:border-cyan-400/70 focus:ring-cyan-400/30',
      'green': 'focus:border-green-400/70 focus:ring-green-400/30',
      'emerald': 'focus:border-emerald-400/70 focus:ring-emerald-400/30',
      'teal': 'focus:border-teal-400/70 focus:ring-teal-400/30',
      'indigo': 'focus:border-indigo-400/70 focus:ring-indigo-400/30',
      'violet': 'focus:border-violet-400/70 focus:ring-violet-400/30',
      'pink': 'focus:border-pink-400/70 focus:ring-pink-400/30',
      'rose': 'focus:border-rose-400/70 focus:ring-rose-400/30',
      'orange': 'focus:border-orange-400/70 focus:ring-orange-400/30',
      'amber': 'focus:border-amber-400/70 focus:ring-amber-400/30',
      'yellow': 'focus:border-yellow-400/70 focus:ring-yellow-400/30',
      'lime': 'focus:border-lime-400/70 focus:ring-lime-400/30',
      'red': 'focus:border-red-400/70 focus:ring-red-400/30',
    };
    return colorMap[accentColor] || 'focus:border-purple-400/70 focus:ring-purple-400/30';
  };

  const getAccentBorderClass = (accentColor: string) => {
    const colorMap: Record<string, string> = {
      'purple': 'border-purple-400/40',
      'blue': 'border-blue-400/40',
      'cyan': 'border-cyan-400/40',
      'green': 'border-green-400/40',
      'emerald': 'border-emerald-400/40',
      'teal': 'border-teal-400/40',
      'indigo': 'border-indigo-400/40',
      'violet': 'border-violet-400/40',
      'pink': 'border-pink-400/40',
      'rose': 'border-rose-400/40',
      'orange': 'border-orange-400/40',
      'amber': 'border-amber-400/40',
      'yellow': 'border-yellow-400/40',
      'lime': 'border-lime-400/40',
      'red': 'border-red-400/40',
    };
    return colorMap[accentColor] || 'border-purple-400/40';
  };
  
  // Get room from URL hash
  const getRoomFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || undefined;
  };
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(getRoomFromHash());
  
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  
  // Sidebar states
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('rooms');
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('settings');
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('home');
  const [callMode, setCallMode] = useState<'voice' | 'video'>('voice');
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [retentionNow, setRetentionNow] = useState(Date.now());

  // Space categories state (shared between settings and room creation)
  const [spaceCategories, setSpaceCategoriesState] = useState([
    { id: '1', name: 'General', icon: 'faHashtag', color: 'cyan', description: 'General discussions' },
    { id: '2', name: 'Projects', icon: 'faRocket', color: 'purple', description: 'Project-related rooms' },
    { id: '3', name: 'Meetings', icon: 'faBriefcase', color: 'blue', description: 'Meeting rooms' },
    { id: '4', name: 'Ideas', icon: 'faLightbulb', color: 'yellow', description: 'Brainstorming and ideas' },
    { id: '5', name: 'Gaming', icon: 'faGamepad', color: 'green', description: 'Gaming discussions' }
  ]);

  // Fetch space data
  const { data: space, isLoading: loadingSpace } = useSpace(spaceId);
  const { data: spaceMembers = [] } = useSpaceMembers(spaceId);
  
  // Fetch rooms for this space
  const { data: rooms = [], isLoading: loadingRooms } = useSpaceRooms(spaceId);
  
  // Fetch selected room data
  const { data: selectedRoom } = useRoom(selectedRoomId);
  const { data: roomSettingsData } = useRoomSettings(selectedRoomId);
  const roomSettingsDataResolved = roomSettingsData || DEFAULT_ROOM_SETTINGS;

  // Get settings for current room (after room data is available)
  const roomCategory = selectedRoom?.category || 'General';
  const roomSettings = chatSettings.getSettingsForRoom(selectedRoomId, roomCategory);
  const { theme } = roomSettings;

  const membershipRole = (spaceMembers.find((member: any) => (member.user_id || member.user?.id) === user?.id)?.role || 'viewer') as MemberRole;
  const isOwner = !!space?.owner_id && space.owner_id === user?.id;
  const currentUserRole = (isOwner ? 'owner' : membershipRole) as MemberRole;
  const canManageSpaceSettings = hasPermission(currentUserRole, 'canUpdateSpaceSettings');
  const canManageRoomSettings = ['owner', 'admin', 'editor'].includes(currentUserRole);
  const canModerateRoom = ['owner', 'admin'].includes(currentUserRole);

  // Fetch room members
  const { data: roomMembers = [] } = useRoomMembers(selectedRoomId);
  
  // Fetch room messages (infinite query)
  const {
    data: messagesData,
    isLoading: loadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRoomMessages(selectedRoomId);

  const { data: pinnedMessages = [] } = usePinnedMessages(selectedRoomId);
  
  // Flatten messages from infinite query
  // Each page has messages in ascending order (oldest to newest) after getRoomMessages reverses
  // Pages are: [page0 (newest 50), page1 (older 50), page2 (even older 50), ...]
  // We need: [oldest from page2, ..., newest from page2, oldest from page1, ..., newest from page1, oldest from page0, ..., newest from page0]
  // So we reverse pages, then flatten
  const messages = messagesData?.pages.slice().reverse().flat() || [];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRetentionNow(Date.now());
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const visibleMessages = useMemo(() => {
    const nowMs = retentionNow;
    return messages.filter((message) => {
      if (!message.expires_at) return true;
      const expiresAt = new Date(message.expires_at).getTime();
      if (expiresAt > nowMs) return true;
      if (message.is_pinned) {
        if (!message.pinned_until) return true;
        return new Date(message.pinned_until).getTime() > nowMs;
      }
      return false;
    });
  }, [messages, retentionNow]);

  const activePinnedMessages = useMemo(() => {
    const nowMs = retentionNow;
    return [...pinnedMessages]
      .filter((message) => {
        if (!message.is_pinned) return false;
        if (message.is_kept) return false; // Kept messages are separate
        if (!message.pinned_until) return true;
        return new Date(message.pinned_until).getTime() > nowMs;
      })
      .sort((a, b) => {
        const aTime = new Date(a.pinned_at || a.created_at).getTime();
        const bTime = new Date(b.pinned_at || b.created_at).getTime();
        return bTime - aTime;
      });
  }, [pinnedMessages, retentionNow]);

  const keptMessages = useMemo(() => {
    return [...pinnedMessages]
      .filter((message) => message.is_kept === true)
      .sort((a, b) => {
        const aTime = new Date(a.pinned_at || a.created_at).getTime();
        const bTime = new Date(b.pinned_at || b.created_at).getTime();
        return bTime - aTime;
      });
  }, [pinnedMessages]);

  const bannerPinnedMessages = activePinnedMessages;
  
  // Mutations
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();
  const pinMessage = usePinMessage();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const markRoomAsRead = useMarkRoomAsRead();
  const bookmarkMessage = useBookmarkMessage();
  const createRoomMutation = useCreateRoom();
  const updateMessage = useUpdateMessage();
  
  // Real-time features
  const {
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
    stopTyping,
  } = useRealtimeChat(
    supabase as any,
    spaceId,
    selectedRoomId,
    user?.id,
    !!selectedRoomId
  );

  // Ensure default "general" room exists and select it
  useEffect(() => {
    if (!spaceId || loadingRooms || !space) return;
    
    // Prevent infinite loop - only try once per space
    const attemptedKey = `room-create-attempted-${spaceId}`;
    if (sessionStorage.getItem(attemptedKey)) {
      // Already attempted, just select first available room
      if (!selectedRoomId && rooms.length > 0) {
        setSelectedRoomId(rooms[0].id);
      }
      return;
    }

    const ensureGeneralRoom = async () => {
      try {
        const generalRoom = rooms.find(r => r.name.toLowerCase() === 'general');
        
        if (!generalRoom && rooms.length === 0) {
          console.log('[SpaceChatView] Creating default General room...');
          sessionStorage.setItem(attemptedKey, 'true');
          
          const newRoom = await createRoomMutation.mutateAsync({
            space_id: spaceId,
            name: 'General',
            description: 'Default room for all space members',
            type: 'text',
            category: 'General',
            is_private: false,
          });
          
          if (newRoom) {
            console.log('[SpaceChatView] General room created:', newRoom.id);
            
            // Wait a moment for the room_member insert to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setSelectedRoomId(newRoom.id);
          }
        } else if (generalRoom && !selectedRoomId) {
          console.log('[SpaceChatView] Selecting existing General room');
          setSelectedRoomId(generalRoom.id);
        } else if (rooms.length > 0 && !selectedRoomId) {
          console.log('[SpaceChatView] Selecting first available room');
          setSelectedRoomId(rooms[0].id);
        }
      } catch (error) {
        console.error('[SpaceChatView] Failed to create general room:', error);
        sessionStorage.setItem(attemptedKey, 'true');
        
        if (rooms.length > 0 && !selectedRoomId) {
          setSelectedRoomId(rooms[0].id);
        }
      }
    };
    
    // Delay to ensure data is fully loaded
    const timeoutId = setTimeout(ensureGeneralRoom, 300);
    return () => clearTimeout(timeoutId);
  }, [spaceId, rooms.length, loadingRooms, selectedRoomId, space, createRoomMutation]);




  useEffect(() => {
    if (!selectedRoomId || !user?.id) return;
    
    const checkMembership = async () => {
      const { data: membership, error } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', selectedRoomId)
        .eq('user_id', user.id)
        .single();
      
      console.log('[SpaceChatView] Room membership:', { 
        roomId: selectedRoomId, 
        membership, 
        error,
        isMember: !!membership 
      });
    };
    
    checkMembership();
  }, [selectedRoomId, user?.id]);







  // Mark room as read when viewing
  useEffect(() => {
    if (selectedRoomId && user?.id) {
      markRoomAsRead.mutate(selectedRoomId);
    }
  }, [selectedRoomId, user?.id]);

  // Update URL hash when room changes
  useEffect(() => {
    if (selectedRoomId) {
      window.location.hash = selectedRoomId;
    }
  }, [selectedRoomId]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const roomId = getRoomFromHash();
      if (roomId && roomId !== selectedRoomId) {
        setSelectedRoomId(roomId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedRoomId]);

const handleSelectRoom = async (roomId: string) => {
  setSelectedRoomId(roomId);
  setReplyTo(null);
  setEditingMessage(null);
  
  // Auto-join room if not already a member
  if (user?.id) {
    try {
      const { data: membership, error } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error on no results
      
      if (!membership) {
        const { error: insertError } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: user.id,
            role: 'member',
            notification_preference: 'all',
            is_muted: false,
          });
        
        if (insertError) {
          console.error('[SpaceChatView] Failed to join room:', insertError);
        } else {
          console.log('[SpaceChatView] Successfully joined room');
        }
      }
    } catch (error) {
      console.error('[SpaceChatView] Error checking/joining room:', error);
    }
  }
};

  const handleCreateRoom = async (name: string, description?: string) => {
    if (!spaceId) return;
    try {
      const newRoom = await createRoomMutation.mutateAsync({
        space_id: spaceId,
        name,
        description,
        type: 'text',
        category: 'General',
        is_private: false,
      });
      setSelectedRoomId(newRoom.id);
      setLeftSidebarTab('rooms');
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };


  // Industry standard: Simple, fast message sending
const handleSendMessage = useCallback((
  content: string,
  type: string = 'text',
  attachments: any[] = []
) => {
  if (!selectedRoomId || !spaceId || !content.trim()) return;

  // If editing, use update mutation
  if (editingMessage) {
    // Capture and clear immediately for smooth UX
    const messageId = editingMessage.id;
    setEditingMessage(null);

    updateMessage.mutate({
      messageId,
      content: content.trim(),
    });
    return;
  }

  // Capture reply ID and clear immediately for smooth UX
  const replyToId = replyTo?.id;
  if (replyTo) {
    setReplyTo(null);
  }

  const retentionMs = getMessageRetentionMs(roomSettingsDataResolved.messageRetention);
  const expiresAt = getMessageRetentionExpiresAt(roomSettingsDataResolved.messageRetention);
  const ttl = retentionMs ? Math.floor(retentionMs / 1000) : undefined;

  // Normal send - fire and forget, realtime will handle the update
  sendMessage.mutate({
    room_id: selectedRoomId,
    space_id: spaceId,
    content,
    message_type: type as any,
    attachments,
    reply_to_id: replyToId,
    ttl,
    expires_at: expiresAt || undefined,
  });
}, [selectedRoomId, spaceId, replyTo, editingMessage, sendMessage, updateMessage, roomSettingsDataResolved.messageRetention]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [deleteMessage]);

  const handlePinMessage = useCallback(
    async (messageId: string, options: { pin: boolean; pinnedUntil?: string | null; keep?: boolean }) => {
      try {
        await pinMessage.mutateAsync({
          messageId,
          pin: options.pin,
          pinnedUntil: options.pinnedUntil,
          keep: options.keep,
        });
      } catch (error) {
        console.error('Failed to pin/keep message:', error);
      }
    },
    [pinMessage]
  );

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await addReaction.mutateAsync({ messageId, reaction: emoji });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [addReaction]);

  const handleRemoveReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await removeReaction.mutateAsync({ messageId, reaction: emoji });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  }, [removeReaction]);

  const handleBookmark = useCallback(async (messageId: string) => {
    try {
      await bookmarkMessage.mutateAsync({ messageId });
    } catch (error) {
      console.error('Failed to bookmark message:', error);
    }
  }, [bookmarkMessage]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  const handleScrollToMessage = useCallback(async (messageId: string) => {
    // First check if message is already loaded
    let messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // If not loaded, keep fetching pages until we find it
    let attempts = 0;
    const maxAttempts = 20; // Allow more attempts for deep pagination

    while (attempts < maxAttempts) {
      if (!hasNextPage) {
        console.warn(`Message ${messageId} not found - reached end of messages`);
        break;
      }

      if (isFetchingNextPage) {
        // Wait for current fetch to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        continue;
      }

      attempts++;
      console.log(`Fetching page ${attempts} to find message ${messageId}`);

      await fetchNextPage();

      // Wait for the DOM and state to update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check again
      messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        console.log(`Found message ${messageId} after ${attempts} page fetches`);
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    console.warn(`Message ${messageId} not found after fetching ${attempts} pages`);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onlineCount = Array.from(onlineUsers.values()).filter((u: any) => u.status === 'online').length;
  const memberCount = roomMembers.length;
  const inactiveCount = Math.max(memberCount - onlineCount, 0);


  if (loadingSpace) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="h-screen flex items-center justify-center bg-transparent">
        <div className="text-center p-8 rounded-xl backdrop-blur-xl bg-black/70">
          <p className="text-white text-xl font-bold mb-6">Space not found</p>
          <button
            onClick={() => navigate('/spaces')}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Return to Spaces
          </button>
        </div>
      </div>
    );
  }


  const centerPanelBackgroundStyle = getBackgroundStyle(theme);
  const ambientBackgroundStyle = getAmbientBackgroundStyle(theme, ambientLighting, ambientIntensity);

return (
  <div className="h-full flex bg-transparent overflow-hidden relative">
    {/* Main content area */}
    <div className="flex-1 flex overflow-hidden relative">
    {/* Ambient Background Overlay for Side Panels */}
    <div
      key={`ambient-${ambientIntensity}-${ambientLighting}-${theme.backgroundType}`}
      className="absolute inset-0 pointer-events-none z-0 transition-all duration-300"
      style={ambientBackgroundStyle}
    />

    {/* LEFT PANEL - Space Info + Rooms Sidebar */}
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-80 flex-shrink-0 bg-black/98 backdrop-blur-sm flex flex-col relative z-10"
    >
      {/* Space Info at Top of Left Panel */}
      <div className="flex-shrink-0 p-4">
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-xl blur-sm" />
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
          <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          <div className="relative px-4 py-3 rounded-xl backdrop-blur-xl bg-black/80 flex items-center gap-3 shadow-lg shadow-black/30">
            <button
              onClick={() => navigate(`/spaces/${spaceId}`)}
              className="w-9 h-9 rounded-lg bg-zinc-800/90 hover:bg-zinc-800 flex items-center justify-center transition-colors shadow-lg shadow-black/20"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400 text-sm" />
            </button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: space?.color || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
            >
              <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white truncate">{space?.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="px-2 py-0.5 rounded-lg bg-white/5 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faHashtag} className="text-cyan-400 text-xs" />
                  <span className="text-sm text-gray-300 truncate">{selectedRoom?.name || 'Select a room'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Sidebar Below */}
      <div className="flex-1 overflow-hidden">
        <LeftSidebar
          spaceId={spaceId}
          space={space}
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          activeTab={leftSidebarTab}
          onTabChange={setLeftSidebarTab}
          isLoading={loadingRooms}
          onlineUsers={onlineUsers}
          onOpenSettings={() => setShowGeneralSettings(!showGeneralSettings)}
          onOpenCreateRoomModal={() => setShowCreateRoomModal(true)}
          showGeneralSettings={showGeneralSettings}
          canManageSpaceSettings={canManageSpaceSettings}
          categories={spaceCategories}
          onCategoriesChange={setSpaceCategoriesState}
          theme={theme}
          getAccentFocusClass={getAccentFocusClass}
        />
      </div>
    </motion.div>

    {/* CENTER PANEL - FULL HEIGHT MESSAGES (Nothing at top!) */}
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10"
      style={centerPanelBackgroundStyle}
    >
      {/* For featured themes, conditionally use mirrored backgrounds for seamless stitching */}
      {theme.backgroundType === 'featured' && theme.backgroundImage && (
        <>
          {/* Smart tiled pattern that adapts to screen size and prevents stretching */}
          <div
            key={`${theme.backgroundImage}-${shouldUseMirror}`}
            className="absolute inset-0 pointer-events-none -z-10 flex flex-nowrap overflow-hidden"
            style={{ gap: 0 }}
          >
            {[...Array(shouldUseMirror ? tileCount * 2 : tileCount)].map((_, i) => {
              // When using mirror, alternate between original and mirrored images for seamless tiling
              // When not using mirror, just use the original image repeatedly
              const useMirrorImage = shouldUseMirror && i % 2 === 1;
              const imageSrc = useMirrorImage
                ? theme.backgroundImage?.replace('/src/assets/chat_themes_3/', '/src/assets/chat_themes_3_mirror/')
                : theme.backgroundImage;

              return (
                <img
                  key={i}
                  src={imageSrc}
                  alt=""
                  className="flex-shrink-0"
                  style={{
                    height: imageHeight, // Dynamic height based on screen size
                    width: 'auto', // Let width scale naturally with aspect ratio
                    objectFit: 'cover', // Fill space while maintaining aspect ratio
                    objectPosition: 'center',
                  }}
                />
              );
            })}
          </div>
          
          {/* Dark overlay on top of images but behind content - dims the background */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none -z-[9]" />
        </>
      )}
      
      {selectedRoomId ? (
        <>
          {/* Messages Area - FULL HEIGHT */}
          <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
            <PinnedBanner
              pinnedMessages={bannerPinnedMessages}
              onScrollToMessage={handleScrollToMessage}
            />

            <div className="flex-1 min-h-0 overflow-hidden">
            <MessagesList
              messages={visibleMessages}
              currentUserId={user?.id}
              onLoadMore={handleLoadMore}
              hasMore={hasNextPage}
              isLoading={loadingMessages}
              isFetchingMore={isFetchingNextPage}
              onReply={setReplyTo}
              onEdit={setEditingMessage}
              onDelete={handleDeleteMessage}
              onPin={handlePinMessage}
              onBookmark={handleBookmark}
              onReaction={handleReaction}
              onRemoveReaction={handleRemoveReaction}
              theme={theme}
              fontSize={roomSettings.fontSize}
              messageDensity={roomSettings.messageDensity}
              messageRetention={roomSettingsDataResolved.messageRetention}
              typingUsers={typingUsers}
              showAvatars={showAvatars}
              showUsernames={showUsernames}
              showTimestamps={showTimestamps}
              showReadReceipts={showReadReceipts}
              showMessageStatus={showMessageStatus}
              enableMessageReactions={roomSettingsDataResolved.enableMessageReactions}
              enableMessageReplies={roomSettingsDataResolved.enableMessageReplies}
              enableMessageForwarding={roomSettingsDataResolved.enableMessageForwarding}
              allowMessageEditing={roomSettingsDataResolved.allowMessageEditing}
              allowMessageDeletion={roomSettingsDataResolved.allowMessageDeletion}
              allowMessagePinning={pinImportantMessages}
              groupMessages={groupMessages}
              autoScrollToBottom={autoScrollToBottom}
              messageAnimations={messageAnimations}
              reduceAnimations={reduceAnimations}
            />
            </div>

          </div>

          {/* Input Area */}
          <div className="flex-shrink-0">
            <MessageInput
              onSend={handleSendMessage}
              onTyping={() => {
                if (showTypingIndicator) {
                  sendTypingIndicator();
                }
              }}
              onStopTyping={() => {
                if (showTypingIndicator) {
                  stopTyping();
                }
              }}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              placeholder={`Message #${selectedRoom?.name || 'room'}...`}
              allowFileUploads={roomSettingsDataResolved.allowFileUploads}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-white/5 flex items-center justify-center">
              <FontAwesomeIcon icon={faHashtag} className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Select a room</h3>
            <p className="text-gray-400">
              Choose a room from the sidebar to start chatting
            </p>
          </div>
        </div>
      )}
    </motion.div>

    {/* RIGHT PANEL - Beautiful Buttons + Right Sidebar */}
    <motion.div
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-80 flex-shrink-0 bg-black/98 backdrop-blur-sm flex flex-col relative z-10"
    >

      {/* Beautiful Action Buttons at Top of Right Panel */}
      {selectedRoom && (
        <div className="flex-shrink-0 px-4 py-3 space-y-3 box-border">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              {
                icon: faHouse,
                label: 'Home',
                glowClass: 'from-cyan-500/25 via-cyan-500/20 to-cyan-500/25',
                borderClass: 'border-cyan-500/30',
                textClass: 'text-cyan-400',
                action: 'home',
              },
              {
                icon: faUsers,
                label: 'Members',
                glowClass: 'from-purple-500/25 via-purple-500/20 to-purple-500/25',
                borderClass: 'border-purple-500/30',
                textClass: 'text-purple-400',
                count: onlineCount,
                action: 'members',
              },
              { icon: faSearch, label: 'Search', glowClass: 'from-cyan-500/25 via-cyan-500/20 to-cyan-500/25', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-400', action: 'search' },
              { icon: faPhone, label: 'Call', glowClass: 'from-green-500/25 via-green-500/20 to-green-500/25', borderClass: 'border-green-500/30', textClass: 'text-green-400', action: 'call' },
              { icon: faVideo, label: 'Video', glowClass: 'from-red-500/25 via-red-500/20 to-red-500/25', borderClass: 'border-red-500/30', textClass: 'text-red-400', action: 'video' },
              { icon: showNavbar ? faChevronUp : faChevronDown, label: 'Toggle Navbar', glowClass: 'from-blue-500/25 via-blue-500/20 to-blue-500/25', borderClass: 'border-blue-500/30', textClass: 'text-blue-400', action: 'navbar' },
              { icon: faThumbtack, label: 'Pin', glowClass: 'from-yellow-500/25 via-yellow-500/20 to-yellow-500/25', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-400', action: 'pin' },
              { icon: faBookmark, label: 'Keep', glowClass: 'from-emerald-500/25 via-emerald-500/20 to-emerald-500/25', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-400', action: 'keep' },
              { icon: faStar, label: 'Saved', glowClass: 'from-amber-500/25 via-amber-500/20 to-amber-500/25', borderClass: 'border-amber-500/30', textClass: 'text-amber-400', action: 'saved' },
              { icon: faCog, label: 'Settings', glowClass: 'from-gray-500/25 via-gray-500/20 to-gray-500/25', borderClass: 'border-gray-500/30', textClass: 'text-gray-400', action: 'settings' },
            ].map(({ icon, label, glowClass, borderClass, textClass, count, action }) => {
              const isActive = (action === 'home' && rightPanelView === 'home') || (action === 'members' && rightPanelView === 'members');
              return (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group/btn"
                >
                  <div className={`absolute -inset-[1px] box-border bg-gradient-to-r ${glowClass} rounded-xl blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                  <div className={`absolute inset-0 box-border rounded-xl border ${borderClass} opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                  <div className="absolute -inset-2 box-border bg-black/40 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-2xl transition-all duration-500" />
                  {isActive && (
                    <div className={`absolute -inset-[1px] box-border rounded-xl border ${borderClass}`} />
                  )}
                  <button
                    onClick={() => {
                      if (action === 'home') setRightPanelView('home');
                      else if (action === 'members') setRightPanelView('members');
                      else if (action === 'search') setRightPanelView('search');
                      else if (action === 'pin') setRightPanelView('pin');
                      else if (action === 'keep') setRightPanelView('keep');
                      else if (action === 'saved') setRightPanelView('saved');
                      else if (action === 'call') {
                        setCallMode('voice');
                        setRightPanelView('call');
                      }                       else if (action === 'video') {
                        setCallMode('video');
                        setRightPanelView('call');
                      } else if (action === 'navbar') {
                        toggleNavbar();
                      }
                      else if (action === 'settings') {
                        setRightPanelView('home');
                        setRightSidebarTab('settings');
                      }
                    }}
                    className={`relative w-10 h-10 rounded-xl backdrop-blur-xl bg-black/80 hover:bg-black/90 flex items-center justify-center transition-all shadow-lg shadow-black/30 ${textClass}`}
                    title={label}
                  >
                    <FontAwesomeIcon icon={icon} className="text-sm" />
                    {count !== undefined && count > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">
                        {count}
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Right Sidebar Below */}
      <div className="flex-1 overflow-hidden">
        {rightPanelView === 'members' ? (
          <RoomMembersPanel
            roomMembers={roomMembers}
            onlineUsers={onlineUsers}
            onlineCount={onlineCount}
            inactiveCount={inactiveCount}
          />
        ) : rightPanelView === 'search' ? (
          <RoomSearchPanel
            roomId={selectedRoomId}
            onScrollToMessage={handleScrollToMessage}
          />
        ) : rightPanelView === 'pin' ? (
          <PinnedMessagesPanel
            pinnedMessages={activePinnedMessages}
            onUnpin={(messageId) => handlePinMessage(messageId, { pin: false })}
            onScrollToMessage={handleScrollToMessage}
          />
        ) : rightPanelView === 'keep' ? (
          <KeptMessagesPanel
            keptMessages={keptMessages}
            onUnkeep={(messageId) => handlePinMessage(messageId, { pin: false })}
            onScrollToMessage={handleScrollToMessage}
          />
        ) : rightPanelView === 'saved' ? (
          <BookmarkedMessagesPanel
            spaceId={spaceId}
            roomId={selectedRoomId}
            onScrollToMessage={handleScrollToMessage}
          />
        ) : rightPanelView === 'call' ? (
          <RoomCallPanel
            roomId={selectedRoomId}
            roomName={selectedRoom?.name}
            mode={callMode}
            onModeChange={setCallMode}
          />
        ) : (
          <RightSidebar
            activeTab={rightSidebarTab}
            onTabChange={setRightSidebarTab}
            theme={theme}
            onThemeChange={(newTheme, roomId, category) => useChatSettingsStore.getState().setTheme(newTheme, roomId, category)}
            messages={visibleMessages}
            roomMembers={roomMembers}
            onlineUsers={onlineUsers}
            selectedRoom={selectedRoom}
            selectedRoomId={selectedRoomId}
            spaceId={spaceId}
            canManageRoomSettings={canManageRoomSettings}
            canModerateRoom={canModerateRoom}
            getAccentFocusClass={getAccentFocusClass}
          />
        )}
      </div>
    </motion.div>

    <CreateRoomModal
      isOpen={showCreateRoomModal}
      onClose={() => setShowCreateRoomModal(false)}
      spaceId={spaceId}
      categories={spaceCategories}
    />
    </div>
  </div>
);
}
