// Advanced Chat Interface with Island-Based Sidebars
// web/src/pages/SpaceChatView.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faHashtag, faRocket, faBell,
  faCog, faChartLine, faTasks, faClock, faStickyNote, faPalette,
  faImages, faLink, faSlidersH, faShapes,
  faBolt, faCalendar, faFire, faBrain, faPhone, faVideo,
  faUsers, faThumbtack, faSearch, faChevronDown, faTrash,
  faCheck, faLayerGroup,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useSpace } from '../hooks/useSpaces';
import {
  useSpaceRooms,
  useRoom,
  useRoomMessages,
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
import { RoomsList } from '../components/spaces/chat/RoomList';
import { MessagesList } from '../components/spaces/chat/MessagesList';
import { MessageInput } from '../components/spaces/chat/MessageInput';
import type { Message as MessageType } from '@4space/shared/src/services/messages.service';

type LeftSidebarTab = 'rooms' | 'metrics' | 'productivity' | 'reminders' | 'notes';
type RightSidebarTab = 'chat' | 'media' | 'links' | 'customization';

export function SpaceChatView() {
  const { id: spaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  
  // Sidebar states
  const [leftSidebarTab, setLeftSidebarTab] = useState<LeftSidebarTab>('rooms');
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>('chat');
  
  // Customization states
  const [chatTheme, setChatTheme] = useState({
    background: 'black',
    messageBubbleShape: 'rounded-xl',
    messageBubbleColor: 'cyan-500/10',
    ownMessageColor: 'cyan-500/20',
    textColor: 'white',
    accentColor: 'cyan',
  });

  // Fetch space data
  const { data: space, isLoading: loadingSpace } = useSpace(spaceId);
  
  // Fetch rooms for this space
  const { data: rooms = [], isLoading: loadingRooms } = useSpaceRooms(spaceId);
  
  // Fetch selected room data
  const { data: selectedRoom } = useRoom(selectedRoomId);
  
  // Fetch room messages (infinite query)
  const {
    data: messagesData,
    isLoading: loadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRoomMessages(selectedRoomId);
  
  // Flatten messages from infinite query
  const messages = messagesData?.pages.flat() || [];
  
  // Mutations
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();
  const pinMessage = usePinMessage();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const markRoomAsRead = useMarkRoomAsRead();
  const bookmarkMessage = useBookmarkMessage();
  const createRoomMutation = useCreateRoom();
  
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

  const handleSendMessage = useCallback(async (
    content: string,
    type: string = 'text',
    attachments: any[] = []
  ) => {
    if (!selectedRoomId || !spaceId || !content.trim()) return;

    try {
      await sendMessage.mutateAsync({
        room_id: selectedRoomId,
        space_id: spaceId,
        content,
        message_type: type as any,
        attachments,
        reply_to_id: replyTo?.id,
      });
      
      setReplyTo(null);
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [selectedRoomId, spaceId, replyTo, sendMessage, stopTyping]);

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onlineCount = Array.from(onlineUsers.values()).filter((u: any) => u.status === 'online').length;

  if (loadingSpace) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
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

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden" style={{ backgroundColor: chatTheme.background }}>
      {/* Header with Separate Island Cards */}
      <div className="flex-shrink-0 pt-2 pl-4 pr-4 pb-0 space-y-3">
        {/* Top Row - Space Info & Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Space Info Island */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-cyan-500/25 rounded-xl blur-sm" />
            <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
            <div className="absolute -inset-2 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <div className="relative px-4 py-3 rounded-xl backdrop-blur-xl bg-black/70 flex items-center gap-3">
              <button
                onClick={() => navigate(`/spaces/${spaceId}`)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400 text-sm" />
              </button>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: space?.color || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
              >
                <FontAwesomeIcon icon={faRocket} className="text-white text-lg" />
              </div>
              
              <div>
                <h2 className="text-base font-bold text-white">{space?.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="px-2 py-0.5 rounded-lg bg-white/5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faHashtag} className="text-cyan-400 text-xs" />
                    <span className="text-sm text-gray-300">{selectedRoom?.name || 'Select a room'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Islands - Spread Out */}
          <div className="flex items-center gap-2">
            {[
              { icon: faSearch, label: 'Search', glowClass: 'from-cyan-500/25 via-cyan-500/20 to-cyan-500/25', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-400' },
              { icon: faUsers, label: 'Members', glowClass: 'from-purple-500/25 via-purple-500/20 to-purple-500/25', borderClass: 'border-purple-500/30', textClass: 'text-purple-400', count: onlineCount },
              { icon: faPhone, label: 'Call', glowClass: 'from-green-500/25 via-green-500/20 to-green-500/25', borderClass: 'border-green-500/30', textClass: 'text-green-400' },
              { icon: faVideo, label: 'Video', glowClass: 'from-red-500/25 via-red-500/20 to-red-500/25', borderClass: 'border-red-500/30', textClass: 'text-red-400' },
              { icon: faThumbtack, label: 'Pinned', glowClass: 'from-yellow-500/25 via-yellow-500/20 to-yellow-500/25', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-400' },
              { icon: faCog, label: 'Settings', glowClass: 'from-gray-500/25 via-gray-500/20 to-gray-500/25', borderClass: 'border-gray-500/30', textClass: 'text-gray-400' },
            ].map(({ icon, label, glowClass, borderClass, textClass, count }) => (
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
                  className={`relative w-10 h-10 rounded-xl backdrop-blur-xl bg-black/70 hover:bg-black/80 flex items-center justify-center transition-all ${textClass}`}
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
      </div>

      {/* Main Content Area with Sidebars */}
      <div className="flex-1 flex overflow-hidden gap-0 p-0">
        {/* Left Sidebar - Bigger with faded bg */}
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 flex-shrink-0 bg-zinc-950/30"
        >
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
            onOpenSettings={() => setRightSidebarTab('chat')}
          />
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {selectedRoomId ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
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
                  disabled={sendMessage.isPending}
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

        {/* Right Sidebar - Bigger with faded bg */}
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 flex-shrink-0 bg-zinc-950/30"
        >
          <RightSidebar
            activeTab={rightSidebarTab}
            onTabChange={setRightSidebarTab}
            theme={chatTheme}
            onThemeChange={setChatTheme}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Left Sidebar Component - Horizontal Utility Tabs at Bottom
interface LeftSidebarProps {
  spaceId?: string;
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
      {/* Rooms Section - Takes Most Space */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
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
                title="Room Settings"
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
            onCreateRoom={() => onCreateRoom('New Room')}
            isLoading={isLoading}
            onlineUsers={onlineUsers}
          />
        </div>
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
                {openUtility === 'productivity' && <ProductivityTab />}
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
}

function RightSidebar({
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
}: RightSidebarProps) {
  const tabs: Array<{ id: RightSidebarTab; icon: any; label: string; color: string }> = [
    { id: 'chat', icon: faSlidersH, label: 'Chat', color: 'cyan' },
    { id: 'media', icon: faImages, label: 'Media', color: 'pink' },
    { id: 'links', icon: faLink, label: 'Links', color: 'blue' },
    { id: 'customization', icon: faPalette, label: 'Customize', color: 'purple' },
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
          {activeTab === 'chat' && <ChatSettingsTab />}
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

function ProductivityTab() {
  const handleCreateMeeting = () => {
    // TODO: Implement meeting creation
    alert('Meeting creation coming soon!');
  };

  const handleCreateTask = () => {
    // TODO: Implement task creation
    alert('Task creation coming soon!');
  };

  const handleCreateNote = () => {
    // TODO: Implement note creation
    alert('Note creation coming soon!');
  };

  const handleSetReminder = () => {
    // TODO: Implement reminder
    alert('Reminder creation coming soon!');
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

function ChatSettingsTab() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faCog} className="text-cyan-400" />
        </div>
        <h3 className="text-xs font-bold text-white">Room Settings</h3>
      </div>
      
      <div className="space-y-2">
        {[
          { label: 'Notifications', value: 'All Messages', icon: faBell },
          { label: 'Mute Room', value: 'Off', icon: faBell },
          { label: 'Auto-delete Messages', value: 'Never', icon: faClock },
          { label: 'Message History', value: 'Unlimited', icon: faStickyNote },
        ].map((setting) => (
          <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon icon={setting.icon} className="text-gray-400 text-sm" />
              <span className="text-sm text-white font-medium">{setting.label}</span>
            </div>
            <span className="text-xs text-gray-400">{setting.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faImages} className="text-pink-400" />
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

function CustomizationTab({ theme, onThemeChange }: any) {
  const [fontSize, setFontSize] = useState(14);
  const [messageDensity, setMessageDensity] = useState('comfortable');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  const bubbleShapes = [
    { value: 'rounded-lg', label: 'Rounded', preview: 'rounded-lg' },
    { value: 'rounded-xl', label: 'Pill', preview: 'rounded-xl' },
    { value: 'rounded-2xl', label: 'Extra', preview: 'rounded-2xl' },
    { value: 'rounded-none', label: 'Square', preview: 'rounded-none' },
  ];
  
  const accentColors = [
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-500', light: 'bg-cyan-400' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500', light: 'bg-purple-400' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500', light: 'bg-pink-400' },
    { value: 'green', label: 'Green', color: 'bg-green-500', light: 'bg-green-400' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500', light: 'bg-yellow-400' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500', light: 'bg-blue-400' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500', light: 'bg-orange-400' },
    { value: 'red', label: 'Red', color: 'bg-red-500', light: 'bg-red-400' },
  ];
  
  const backgrounds = [
    { value: 'black', label: 'Black', preview: 'bg-black' },
    { value: 'dark', label: 'Dark', preview: 'bg-gray-900' },
    { value: 'darker', label: 'Darker', preview: 'bg-zinc-950' },
    { value: 'navy', label: 'Navy', preview: 'bg-slate-900' },
  ];

  const messagePatterns = [
    { value: 'none', label: 'None', preview: 'bg-gradient-to-r from-zinc-800 to-zinc-800' },
    { value: 'gradient', label: 'Gradient', preview: 'bg-gradient-to-br from-zinc-800 to-zinc-900' },
    { value: 'subtle', label: 'Subtle', preview: 'bg-gradient-to-tr from-zinc-800 via-zinc-800 to-zinc-700' },
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Theme Colors */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FontAwesomeIcon icon={faPalette} className="text-purple-400" />
          Background Theme
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.value}
              onClick={() => onThemeChange({ ...theme, background: bg.value })}
              className={`p-3 rounded-xl transition-all ${
                theme.background === bg.value
                  ? 'bg-purple-500/10 ring-2 ring-purple-500/50'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className={`w-full h-14 rounded-lg ${bg.preview} mb-2 shadow-lg`} />
              <span className="text-xs text-gray-300 font-medium">{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Accent Color</h3>
        <div className="grid grid-cols-4 gap-2">
          {accentColors.map((accent) => (
            <button
              key={accent.value}
              onClick={() => onThemeChange({ ...theme, accentColor: accent.value })}
              className={`p-3 rounded-xl transition-all ${
                theme.accentColor === accent.value
                  ? 'ring-2 ring-white/30 bg-zinc-800/70'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className={`w-full h-10 rounded-lg ${accent.color} mb-2 shadow-lg`} />
              <span className="text-xs text-gray-300 font-medium">{accent.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Bubble Style */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Message Bubble Shape</h3>
        <div className="grid grid-cols-2 gap-2">
          {bubbleShapes.map((shape) => (
            <button
              key={shape.value}
              onClick={() => onThemeChange({ ...theme, messageBubbleShape: shape.value })}
              className={`p-3 rounded-xl transition-all ${
                theme.messageBubbleShape === shape.value
                  ? 'bg-cyan-500/10 ring-2 ring-cyan-500/50'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className={`w-full h-10 bg-cyan-500/20 ${shape.preview} mb-2`} />
              <span className="text-xs text-gray-300 font-medium">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Pattern */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Message Background</h3>
        <div className="grid grid-cols-3 gap-2">
          {messagePatterns.map((pattern) => (
            <button
              key={pattern.value}
              onClick={() => onThemeChange({ ...theme, messagePattern: pattern.value })}
              className={`p-3 rounded-xl transition-all ${
                theme.messagePattern === pattern.value
                  ? 'ring-2 ring-purple-500/50 bg-zinc-800/70'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className={`w-full h-10 ${pattern.preview} rounded-lg mb-2`} />
              <span className="text-xs text-gray-300 font-medium">{pattern.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Font Size</h3>
          <span className="text-xs text-cyan-400 font-bold">{fontSize}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="18"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Small</span>
          <span>Medium</span>
          <span>Large</span>
        </div>
      </div>

      {/* Message Density */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Message Density</h3>
        <div className="grid grid-cols-3 gap-2">
          {['compact', 'comfortable', 'spacious'].map((density) => (
            <button
              key={density}
              onClick={() => setMessageDensity(density)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                messageDensity === density
                  ? 'bg-green-500/10 text-green-400 ring-2 ring-green-500/50'
                  : 'bg-zinc-800/50 text-gray-400 hover:bg-zinc-800/70 hover:text-white'
              }`}
            >
              {density.charAt(0).toUpperCase() + density.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Display Options</h3>
        <div className="space-y-2">
          {[
            { label: 'Show Timestamps', checked: true, icon: faClock },
            { label: 'Show Avatars', checked: true, icon: faUsers },
            { label: 'Message Animations', checked: animationsEnabled, icon: faBolt, onChange: setAnimationsEnabled },
            { label: 'Show Read Receipts', checked: true, icon: faCheck },
            { label: 'Group Messages', checked: true, icon: faLayerGroup },
            { label: 'Show Link Previews', checked: true, icon: faLink },
          ].map((option) => (
            <label 
              key={option.label} 
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-700/50 group-hover:bg-zinc-700 transition-colors flex items-center justify-center">
                  <FontAwesomeIcon icon={option.icon} className="text-gray-400 text-sm" />
                </div>
                <span className="text-sm text-white font-medium">{option.label}</span>
              </div>
              
              {/* Custom Toggle Switch */}
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={option.checked}
                  onChange={(e) => option.onChange?.(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button 
        onClick={() => {
          onThemeChange({
            background: 'black',
            messageBubbleShape: 'rounded-xl',
            accentColor: 'cyan',
            messagePattern: 'none',
          });
          setFontSize(14);
          setMessageDensity('comfortable');
          setAnimationsEnabled(true);
        }}
        className="w-full px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={faTrash} />
        Reset to Defaults
      </button>
    </div>
  );
}
