// Advanced Chat Interface with Island-Based Sidebars
// web/src/pages/SpaceChatView.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHashtag, faRocket,
  faCog, faChartLine, faTasks, faClock, faStickyNote, faPalette,
  faSlidersH, faImages, faLink,
  faBolt, faCalendar, faFire, faBrain, faPhone, faVideo,
  faUsers, faThumbtack, faSearch,
  faFilter, faTimes, faExclamationTriangle, faEdit, faTrash, faPlus,
  faImage, faPoll, faRobot, faKey, faLock, faMicrophone, faUserCheck,
  faComments, faEnvelope,
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
import { MessagesList } from '../components/spaces/chat/MessagesList';
import { MessageInput } from '../components/spaces/chat/MessageInput';
import { CustomizationTab } from '../components/spaces/chat/CustomizationTab';
import { RoomMetrics } from '../components/spaces/chat/RoomMetrics';
import { RoomMetadataTab } from '../components/spaces/chat/RoomMetadataTab';
import { ChatSettingsTab } from '../components/spaces/chat/ChatSettingsTab';
import { SearchMessages } from '../components/spaces/chat/SearchMessages';
import { PinnedMessages } from '../components/spaces/chat/PinnedMessages';
import { RoomsList } from '../components/spaces/chat/RoomList';
import type { Message as MessageType } from '@4space/shared/src/services/messages.service';
import { useUpdateMessage } from '../hooks/useMessages';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';

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
  
  // Get room from URL hash
  const getRoomFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || undefined;
  };
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(getRoomFromHash());
  
  // Get settings for current room
  const roomSettings = chatSettings.getSettingsForRoom(selectedRoomId);
  const { theme } = roomSettings;
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  
  // Sidebar states
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('rooms');
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('settings');
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
        console.log('[SpaceChatView] Auto-joining room:', roomId);
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
          showGeneralSettings={showGeneralSettings}
          categories={spaceCategories}
          onCategoriesChange={setSpaceCategoriesState}
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
      {/* For featured themes, add alternating mirrored pattern using absolute positioned divs */}
      {theme.backgroundType === 'featured' && theme.backgroundImage && (
        <>
          {/* Tiled pattern using actual img elements for proper sizing - BEHIND everything */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex flex-nowrap overflow-hidden" style={{ gap: 0, height: '100%' }}>
            {[...Array(30)].map((_, i) => (
              <img
                key={i}
                src={i % 2 === 0 ? theme.backgroundImage : (theme.backgroundImage || '').replace('.png', '-mirror.png')}
                alt=""
                className="flex-shrink-0 h-full"
                style={{ 
                  width: 'auto', // Width scales with aspect ratio
                  objectFit: 'cover', // Fill height, maintain aspect ratio
                  objectPosition: 'center',
                }}
              />
            ))}
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
          onThemeChange={(newTheme) => useChatSettingsStore.getState().setTheme(newTheme)}
          messages={messages}
          roomMembers={roomMembers}
          onlineUsers={onlineUsers}
          selectedRoom={selectedRoom}
          selectedRoomId={selectedRoomId}
          spaceId={spaceId}
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
  </div>
);
}

// Left Sidebar Component - Horizontal Utility Tabs at Bottom
interface LeftSidebarProps {
  spaceId: string;
  space: any;
  rooms: any[];
  selectedRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: (name: string, description?: string) => void;
  activeTab: LeftSidebarTab;
  onTabChange: (tab: LeftSidebarTab) => void;
  isLoading: boolean;
  onlineUsers: Map<string, any>;
  onOpenSettings?: () => void;
  showGeneralSettings?: boolean;
  categories?: Array<{ id: string; name: string; icon: string; color: string; description: string }>;
  onCategoriesChange?: (categories: Array<{ id: string; name: string; icon: string; color: string; description: string }>) => void;
}

function LeftSidebar({
  spaceId: _spaceId,
  space: _space,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onCreateRoom,
  activeTab: _activeTab,
  onTabChange: _onTabChange,
  isLoading,
  onlineUsers,
  onOpenSettings,
  showGeneralSettings = false,
  categories = [],
  onCategoriesChange,
}: LeftSidebarProps) {
  const [openUtility, setOpenUtility] = useState<Exclude<LeftSidebarTab, 'rooms'> | null>(null);
  const [filterUnread, setFilterUnread] = useState(false); // Add this state
  const dropdownRef = useRef<HTMLDivElement>(null);

  const utilityTabs: Array<{ id: Exclude<LeftSidebarTab, 'rooms'>; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'purple' },
    { id: 'productivity', icon: faBolt, label: 'Actions', color: 'yellow' },
    { id: 'reminders', icon: faClock, label: 'Reminders', color: 'orange' },
    { id: 'notes', icon: faStickyNote, label: 'Notes', color: 'green' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenUtility(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUtilityClick = (tabId: Exclude<LeftSidebarTab, 'rooms'>) => {
    setOpenUtility(openUtility === tabId ? null : tabId);
  };

  return (
    <div className="h-full flex flex-col" ref={dropdownRef}>
      {/* Main Content Area - Takes Most Space */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {showGeneralSettings ? (
          /* General Settings View */
          <div className="h-full flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faCog} className="text-cyan-400" />
                  General Settings
                </h2>

                <button
                  onClick={() => onOpenSettings?.()}
                  className="w-7 h-7 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                  title="Back to Rooms"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {/* Space Categories Management */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faHashtag} className="text-violet-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Space Categories</h3>
                </div>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-${category.color}-500/20 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={faHashtag} className={`text-${category.color}-400 text-sm`} />
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium">{category.name}</span>
                          <p className="text-xs text-gray-400">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <FontAwesomeIcon icon={faEdit} className="text-xs" />
                        </button>
                        <button
                          onClick={() => onCategoriesChange?.(categories.filter(cat => cat.id !== category.id))}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newCategory = {
                        id: Date.now().toString(),
                        name: 'New Category',
                        icon: 'faHashtag',
                        color: 'gray',
                        description: 'New category description'
                      };
                      onCategoriesChange?.([...categories, newCategory]);
                    }}
                    className="w-full p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg text-gray-400 hover:text-white transition-colors border-2 border-dashed border-zinc-600/50 hover:border-purple-400/50"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Category
                  </button>
                </div>
              </div>

              {/* Default Room Settings */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCog} className="text-cyan-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Default Room Settings</h3>
                </div>

                <div className="space-y-4">
                  {/* Privacy & Access */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLock} className="text-red-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Privacy & Access</h4>
                    </div>
                    {[
                      { icon: faLock, label: 'Private by Default', sublabel: 'New rooms are private', enabled: true, onToggle: () => {}, color: 'red' },
                      { icon: faUserCheck, label: 'Require Approval', sublabel: 'New members need approval', enabled: false, onToggle: () => {}, color: 'yellow' },
                      { icon: faEnvelope, label: 'Require Email', sublabel: 'Members must have verified email', enabled: false, onToggle: () => {}, color: 'emerald' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                          <div>
                            <p className="text-sm text-white font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.sublabel}</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={item.enabled}
                          onToggle={item.onToggle}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Content & Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faImage} className="text-green-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Content & Features</h4>
                    </div>
                    {[
                      { icon: faImage, label: 'Allow File Uploads', sublabel: 'New rooms allow file sharing', enabled: true, onToggle: () => {}, color: 'green' },
                      { icon: faMicrophone, label: 'Voice Messages', sublabel: 'New rooms allow voice messages', enabled: true, onToggle: () => {}, color: 'cyan' },
                      { icon: faPoll, label: 'Polls & Voting', sublabel: 'New rooms allow polls', enabled: true, onToggle: () => {}, color: 'purple' },
                      { icon: faComments, label: 'Allow Threads', sublabel: 'Enable threaded conversations', enabled: true, onToggle: () => {}, color: 'blue' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                          <div>
                            <p className="text-sm text-white font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.sublabel}</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={item.enabled}
                          onToggle={item.onToggle}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Moderation & Limits */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faRobot} className="text-orange-400 text-xs" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Moderation & Limits</h4>
                    </div>
                    {[
                      { icon: faRobot, label: 'Allow Bots', sublabel: 'New rooms allow bots', enabled: false, onToggle: () => {}, color: 'orange' },
                      { icon: faClock, label: 'Slow Mode', sublabel: 'Limit message frequency', enabled: false, onToggle: () => {}, color: 'indigo' },
                      { icon: faUsers, label: 'Member Limits', sublabel: 'Set maximum members', enabled: true, onToggle: () => {}, color: 'teal' },
                      { icon: faTrash, label: 'Auto-delete Messages', sublabel: 'Automatically delete old messages', enabled: false, onToggle: () => {}, color: 'rose' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                          <div>
                            <p className="text-sm text-white font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.sublabel}</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={item.enabled}
                          onToggle={item.onToggle}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Space Features */}
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faRocket} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Space Features</h3>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: faUsers, label: 'Voice Channels', sublabel: 'Enable voice communication', enabled: true, color: 'cyan' },
                    { icon: faVideo, label: 'Video Calls', sublabel: 'Allow video conferencing', enabled: true, color: 'red' },
                    { icon: faImage, label: 'File Sharing', sublabel: 'Allow file uploads globally', enabled: true, color: 'green' },
                    { icon: faPoll, label: 'Polls & Voting', sublabel: 'Enable polls across the space', enabled: true, color: 'purple' },
                    { icon: faRobot, label: 'Bot Integration', sublabel: 'Allow bot accounts', enabled: false, color: 'orange' },
                    { icon: faKey, label: 'API Integrations', sublabel: 'Enable third-party integrations', enabled: false, color: 'blue' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                        <div>
                          <p className="text-sm text-white font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.sublabel}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={item.enabled}
                        onToggle={() => {}}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Rooms Section */
          <>
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faHashtag} className="text-cyan-400" />
                  Rooms
                </h2>

                <div className="flex items-center gap-1.5">
                  {/* Filter Unread Button */}
                  <button
                    onClick={() => setFilterUnread(!filterUnread)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      filterUnread
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800/70'
                    }`}
                    title={filterUnread ? 'Showing Unread Only' : 'Show All Rooms'}
                  >
                    <FontAwesomeIcon icon={faFilter} className="text-xs" />
                  </button>

                  {/* Settings Button */}
                  <button
                    onClick={() => onOpenSettings?.()}
                    className="w-7 h-7 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                    title="General Settings"
                  >
                    <FontAwesomeIcon icon={faCog} className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <RoomsList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={onSelectRoom}
                spaceId={_spaceId}
                onlineUsers={onlineUsers}
                spaceCategories={categories}
              />
            </div>
          </>
        )}
      </div>

      {/* Utility Tabs - Horizontal at Bottom */}
      <div className="flex-shrink-0 border-t border-zinc-800/50">
        {/* Dropdown Content - Opens Above Tabs */}
        <AnimatePresence>
          {openUtility && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-zinc-900/50 border-b border-zinc-800/50"
            >
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {openUtility === 'metrics' && <MetricsTab onlineUsers={onlineUsers} />}
                {openUtility === 'productivity' && <ProductivityTab spaceId={_spaceId} />}
                {openUtility === 'reminders' && <RemindersTab />}
                {openUtility === 'notes' && <NotesTab />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Tab Bar */}
        <div className="p-3 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
            {utilityTabs.map((tab) => {
              const isOpen = openUtility === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleUtilityClick(tab.id)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                    isOpen
                      ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                      : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                    <FontAwesomeIcon 
                      icon={tab.icon} 
                      className={`text-xs ${
                        isOpen 
                          ? `text-${tab.color}-400` 
                          : 'text-gray-500'
                      }`} 
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Right Sidebar Component - Horizontal Tabs at Top with Proper Overflow
interface RightSidebarProps {
  activeTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  theme: any;
  onThemeChange: (theme: any) => void;
  messages: any[];
  roomMembers: any[];
  onlineUsers: Map<string, any>;
  selectedRoom: any;
  selectedRoomId?: string;
  spaceId: string;
}

function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  messages,
  roomMembers,
  onlineUsers,
  selectedRoom,
  selectedRoomId,
  spaceId,
}: RightSidebarProps) {
  const tabs: Array<{ id: RightSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'metrics', icon: faChartLine, label: 'Metrics', color: 'orange' },
    { id: 'media', icon: faImages, label: 'Media', color: 'green' },
    { id: 'links', icon: faLink, label: 'Links', color: 'blue' },
    { id: 'metadata', icon: faHashtag, label: 'Room Info', color: 'pink' },
    { id: 'customization', icon: faPalette, label: 'Theme', color: 'purple' },
    { id: 'settings', icon: faSlidersH, label: 'Settings', color: 'cyan' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Horizontal Tabs - Fixed Overflow */}
      <div className="flex-shrink-0 pb-0 pt-0 pl-4 pr-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pl-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500/10 text-${tab.color}-400`
                  : 'bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-${tab.color}-500/10 flex items-center justify-center`}>
                <FontAwesomeIcon 
                  icon={tab.icon} 
                  className={`text-xs ${
                    activeTab === tab.id 
                      ? `text-${tab.color}-400` 
                      : 'text-gray-500'
                  }`} 
                />
              </div>
              <span className="whitespace-nowrap text-xs">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {activeTab === 'settings' && <ChatSettingsTab roomId={selectedRoomId} />}
          {activeTab === 'metadata' && (
            <RoomMetadataTab
              room={selectedRoom}
              memberCount={roomMembers.length}
              messageCount={messages.length}
              onUpdateRoom={(updates) => {
                console.log('Update room:', updates);
              }}
            />
          )}
          {activeTab === 'metrics' && (
            <RoomMetrics
              messageCount={selectedRoom?.message_count || messages.length}
              memberCount={roomMembers.length}
              onlineCount={onlineUsers.size}
              messages={messages}
              roomMembers={roomMembers}
              onlineUsers={onlineUsers}
              selectedRoom={selectedRoom}
            />
          )}
          {activeTab === 'media' && <MediaTab />}
          {activeTab === 'links' && <LinksTab />}
          {activeTab === 'customization' && (
            <CustomizationTab theme={theme} onThemeChange={onThemeChange} />
          )}
        </div>
      </div>
    </div>
  );
}

// Tab Components - Clean Card Design with Tighter Spacing
function MetricsTab({ onlineUsers }: { onlineUsers: Map<string, any> }) {
  const onlineCount = Array.from(onlineUsers.values()).filter((u: any) => u.status === 'online').length;
  
  return (
    <div className="p-4 space-y-3">
      {/* Activity Card */}
      <div className="p-3.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faFire} className="text-orange-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Activity</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Online Now</span>
            <span className="text-base font-bold text-cyan-400">{onlineCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Messages Today</span>
            <span className="text-base font-bold text-purple-400">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Files Shared</span>
            <span className="text-base font-bold text-pink-400">89</span>
          </div>
        </div>
      </div>

      {/* Engagement Card */}
      <div className="p-3.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="text-purple-400" />
          </div>
          <h3 className="text-xs font-bold text-white">Engagement</h3>
        </div>
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Response Rate</span>
              <span className="text-xs font-bold text-cyan-400">87%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700/50 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600" 
                style={{ width: '87%' }} 
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Avg. Response Time</span>
              <span className="text-xs font-bold text-green-400">12 min</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700/50 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600" 
                style={{ width: '65%' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductivityTab({ spaceId }: { spaceId: string }) {
  const createRoomMutation = useCreateRoom();

  const handleCreateMeeting = async () => {
    if (!spaceId) {
      alert('No space selected.');
      return;
    }

    const titleInput = window.prompt('Meeting title?');
    const title = titleInput?.trim();
    if (!title) return;

    const whenInput = window.prompt('When is the meeting? (optional)');
    const when = whenInput?.trim();

    try {
      const newRoom = await createRoomMutation.mutateAsync({
        space_id: spaceId,
        name: `Meeting: ${title}`,
        description: when ? `Scheduled for ${when}.` : 'Meeting room created from Productivity actions.',
        type: 'text',
        category: 'Meetings',
        is_private: false,
      });

      if (newRoom?.id) {
        window.location.hash = newRoom.id;
      }
    } catch (error) {
      console.error('Failed to create meeting room:', error);
      alert('Failed to create meeting room. Please try again.');
    }
  };

  const handleCreateTask = () => {

    const titleInput = window.prompt('Task title?');
    const title = titleInput?.trim();
    if (!title) return;

    const dueInput = window.prompt('Due date? (optional)');
    const due = dueInput?.trim();

    createRoomMutation
      .mutateAsync({
        space_id: spaceId,
        name: `Task: ${title}`,
        description: due ? `Due ${due}.` : 'Task created from Productivity actions.',
        type: 'text',
        category: 'Tasks',
        is_private: false,
      })
      .then((newRoom) => {
        if (newRoom?.id) {
          window.location.hash = newRoom.id;
        }
      })
      .catch((error) => {
        console.error('Failed to create task room:', error);
        alert('Failed to create task. Please try again.');
      });
  };

  const handleCreateNote = () => {

    const titleInput = window.prompt('Note title?');
    const title = titleInput?.trim();
    if (!title) return;

    const bodyInput = window.prompt('Add a quick note? (optional)');
    const body = bodyInput?.trim();

    createRoomMutation.mutateAsync({
      space_id: spaceId,
      name: `Note: ${title}`,
      description: body || 'Note created from Productivity actions.',
      type: 'text',
      category: 'Notes',
      is_private: false,
    }).then((newRoom) => {
      if (newRoom?.id) {
        window.location.hash = newRoom.id;
      }
    }).catch((error) => {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    });
  };

  const handleSetReminder = () => {
    const reminderInput = window.prompt('Reminder text?');
    const reminderText = reminderInput?.trim();
    if (!reminderText) return;

    const minutesInput = window.prompt('Remind in how many minutes?');
    const minutes = minutesInput ? Number(minutesInput) : NaN;
    if (!Number.isFinite(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes.');
      return;
    }

    const delayMs = minutes * 60 * 1000;
    const scheduledAt = new Date(Date.now() + delayMs).toLocaleString();
    alert(`Reminder set for ${scheduledAt}.`);

    window.setTimeout(() => {
      alert(`Reminder: ${reminderText}`);
    }, delayMs);
  };

  return (
    <div className="p-4 space-y-1.5">
      {[
        { icon: faCalendar, label: 'Schedule Meeting', color: 'blue', bg: 'blue-500/10', onClick: handleCreateMeeting },
        { icon: faTasks, label: 'Create Task', color: 'green', bg: 'green-500/10', onClick: handleCreateTask },
        { icon: faStickyNote, label: 'New Note', color: 'purple', bg: 'purple-500/10', onClick: handleCreateNote },
        { icon: faClock, label: 'Set Reminder', color: 'orange', bg: 'orange-500/10', onClick: handleSetReminder },
      ].map((action) => (
        <motion.button
          key={action.label}
          onClick={action.onClick}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-3.5 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all flex items-center gap-3 group"
        >
          <div className={`w-10 h-10 rounded-lg bg-${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <FontAwesomeIcon icon={action.icon} className={`text-${action.color}-400`} />
          </div>
          <span className="text-sm font-medium text-white">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function RemindersTab() {
  return (
    <div className="p-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="text-2xl text-orange-400" />
        </div>
        <p className="text-sm text-gray-400 mb-3">No reminders set</p>
        <button className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors">
          Create Reminder
        </button>
      </div>
    </div>
  );
}

function NotesTab() {
  return (
    <div className="p-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faStickyNote} className="text-2xl text-green-400" />
        </div>
        <p className="text-sm text-gray-400 mb-3">No notes yet</p>
        <button className="px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium transition-colors">
          Create Note
        </button>
      </div>
    </div>
  );
}


function MediaTab() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faImages} className="text-green-400" />
        </div>
        <h3 className="text-xs font-bold text-white">Shared Media</h3>
      </div>
      
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faImages} className="text-2xl text-gray-600" />
        </div>
        <p className="text-sm text-gray-400">No media shared yet</p>
      </div>
    </div>
  );
}

function LinksTab() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faLink} className="text-blue-400" />
        </div>
        <h3 className="text-xs font-bold text-white">Shared Links</h3>
      </div>
      
      <div className="text-center py-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-zinc-800/50 flex items-center justify-center">
          <FontAwesomeIcon icon={faLink} className="text-2xl text-gray-600" />
        </div>
        <p className="text-sm text-gray-400">No links shared yet</p>
      </div>
    </div>
  );
}
