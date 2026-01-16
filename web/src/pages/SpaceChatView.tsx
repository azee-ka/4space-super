// Advanced Chat Interface with Island-Based Sidebars
// web/src/pages/SpaceChatView.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHashtag, faRocket,
  faCog, faPhone, faVideo,
  faUsers, faThumbtack, faSearch, faTimes, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useChatSettingsStore } from '../store/chatSettingsStore';
import { getBackgroundStyle, getAmbientBackgroundStyle } from '../utils/themeUtils';
import { useSpace } from '../hooks/useSpaces';
import {
  useSpaceRooms,
  useRoom,
  useRoomMessages,
  useRoomMembers,
  useSendMessage,
  useDeleteMessage,
  usePinMessage,
  useAddReaction,
  useRemoveReaction,
  useMarkRoomAsRead,
  useBookmarkMessage,
  useCreateRoom,
} from '../hooks/useMessages';
import { useRealtimeChat } from '../hooks/useRealtime';
import { MessagesList } from '../components/spaces/chat/centerPanel/MessagesList';
import { MessageInput } from '../components/spaces/chat/centerPanel/MessageInput';
import { SearchMessages } from '../components/spaces/chat/rightPanel/SearchMessages';
import { PinnedMessages } from '../components/spaces/chat/rightPanel/PinnedMessages';
import { CreateRoomModal } from '../components/spaces/chat/leftPanel/CreateRoomModal';
import { LeftSidebar } from '../components/spaces/chat/leftPanel/LeftSidebar';
import { RightSidebar } from '../components/spaces/chat/leftPanel/RightSidebar';
import type { Message as MessageType } from '@4space/shared/src/services/messages.service';
import { useUpdateMessage } from '../hooks/useMessages';
import { useShouldUseMirroredBackground, useBackgroundSizing } from '../hooks/useWindowSize';

type LeftSidebarTab = 'rooms' | 'metrics' | 'productivity' | 'reminders' | 'notes';
type RightSidebarTab = 'settings' | 'metadata' | 'metrics' | 'media' | 'links' | 'customization';
type OverlayView = 'search' | 'pins' | 'call' | null;

export function SpaceChatView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [overlayView, setOverlayView] = useState<OverlayView>(null);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);

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
  
  // Fetch rooms for this space
  const { data: rooms = [], isLoading: loadingRooms } = useSpaceRooms(spaceId);
  
  // Fetch selected room data
  const { data: selectedRoom } = useRoom(selectedRoomId);

  // Get settings for current room (after room data is available)
  const roomCategory = selectedRoom?.category || 'General';
  const roomSettings = chatSettings.getSettingsForRoom(selectedRoomId, roomCategory);
  const { theme } = roomSettings;

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
  
  // Flatten messages from infinite query
  // Each page has messages in ascending order (oldest to newest) after getRoomMessages reverses
  // Pages are: [page0 (newest 50), page1 (older 50), page2 (even older 50), ...]
  // We need: [oldest from page2, ..., newest from page2, oldest from page1, ..., newest from page1, oldest from page0, ..., newest from page0]
  // So we reverse pages, then flatten
  const messages = messagesData?.pages.slice().reverse().flat() || [];
  
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
    updateMessage.mutate({
      messageId: editingMessage.id,
      content: content.trim(),
    }, {
      onSuccess: () => {
        setEditingMessage(null);
      }
    });
    return;
  }

  // Normal send - fire and forget, realtime will handle the update
  sendMessage.mutate({
    room_id: selectedRoomId,
    space_id: spaceId,
    content,
    message_type: type as any,
    attachments,
    reply_to_id: replyTo?.id,
  }, {
    onSuccess: () => {
      setReplyTo(null);
    }
  });
}, [selectedRoomId, spaceId, replyTo, editingMessage, sendMessage, updateMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [deleteMessage]);

  const handlePinMessage = useCallback(async (messageId: string, pinned: boolean) => {
    try {
      await pinMessage.mutateAsync({ messageId, pin: pinned });
    } catch (error) {
      console.error('Failed to pin message:', error);
    }
  }, [pinMessage]);

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

  const onlineCount = Array.from(onlineUsers.values()).filter((u: any) => u.status === 'online').length;

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
  <div className="h-screen flex bg-transparent overflow-hidden relative">
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
          <div className="flex-1 min-h-0 overflow-hidden relative">

            <MessagesList
              messages={messages}
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
              typingUsers={typingUsers}
            />

          </div>

          {/* Input Area */}
          <div className="flex-shrink-0">
            <MessageInput
              onSend={handleSendMessage}
              onTyping={sendTypingIndicator}
              onStopTyping={stopTyping}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
              placeholder={`Message #${selectedRoom?.name || 'room'}...`}
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
        <div className="flex-shrink-0 p-4 space-y-3">
          {/* Action Islands - Your Original Beautiful UI */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: faSearch, label: 'Search', glowClass: 'from-cyan-500/25 via-cyan-500/20 to-cyan-500/25', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-400', action: 'search' },
              { icon: faUsers, label: 'Members', glowClass: 'from-purple-500/25 via-purple-500/20 to-purple-500/25', borderClass: 'border-purple-500/30', textClass: 'text-purple-400', count: onlineCount },
              { icon: faPhone, label: 'Call', glowClass: 'from-green-500/25 via-green-500/20 to-green-500/25', borderClass: 'border-green-500/30', textClass: 'text-green-400', action: 'call' },
              { icon: faVideo, label: 'Video', glowClass: 'from-red-500/25 via-red-500/20 to-red-500/25', borderClass: 'border-red-500/30', textClass: 'text-red-400' },
              { icon: faThumbtack, label: 'Pinned', glowClass: 'from-yellow-500/25 via-yellow-500/20 to-yellow-500/25', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-400', action: 'pins' },
              { icon: faCog, label: 'Settings', glowClass: 'from-gray-500/25 via-gray-500/20 to-gray-500/25', borderClass: 'border-gray-500/30', textClass: 'text-gray-400', action: 'settings' },
            ].map(({ icon, label, glowClass, borderClass, textClass, count, action }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative group/btn"
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${glowClass} rounded-xl blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                <div className={`absolute inset-0 rounded-xl border ${borderClass} opacity-0 group-hover/btn:opacity-100 transition-opacity`} />
                <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-2xl transition-all duration-500" />
                
                <button
                  onClick={() => {
                    if (action === 'search') setOverlayView('search');
                    else if (action === 'pins') setOverlayView('pins');
                    else if (action === 'call') setOverlayView('call');
                    else if (action === 'settings') setRightSidebarTab('settings');
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
            ))}
          </div>

        </div>
      )}

      {/* Right Sidebar Below */}
      <div className="flex-1 overflow-hidden">
        <RightSidebar
          activeTab={rightSidebarTab}
          onTabChange={setRightSidebarTab}
          theme={theme}
          onThemeChange={(newTheme, roomId, category) => useChatSettingsStore.getState().setTheme(newTheme, roomId, category)}
          messages={messages}
          roomMembers={roomMembers}
          onlineUsers={onlineUsers}
          selectedRoom={selectedRoom}
          selectedRoomId={selectedRoomId}
          spaceId={spaceId}
          getAccentFocusClass={getAccentFocusClass}
        />
      </div>
    </motion.div>

    {/* Overlay Views */}
    <AnimatePresence>
      {overlayView === 'search' && (
        <SearchMessages
          roomId={selectedRoomId}
          onClose={() => setOverlayView(null)}
        />
      )}
      
      {overlayView === 'pins' && (
        <PinnedMessages
          pinnedMessages={messages.filter(m => m.is_pinned)}
          onClose={() => setOverlayView(null)}
          onUnpin={(messageId) => handlePinMessage(messageId, false)}
          onScrollToMessage={(messageId) => {
            const element = document.getElementById(`message-${messageId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setOverlayView(null);
          }}
        />
      )}
      
      {overlayView === 'call' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center"
        >
          <button
            onClick={() => setOverlayView(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-400" />
          </button>
          <FontAwesomeIcon icon={faPhone} className="text-6xl text-green-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Voice Call</h2>
          <p className="text-gray-400 mb-6">Call feature coming soon</p>
          <button
            onClick={() => setOverlayView(null)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium transition-colors"
          >
            Start Call (Coming Soon)
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    <CreateRoomModal
      isOpen={showCreateRoomModal}
      onClose={() => setShowCreateRoomModal(false)}
      spaceId={spaceId}
      categories={spaceCategories}
    />
  </div>
);
}



