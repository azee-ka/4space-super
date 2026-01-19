// Modern DM Chat Interface - Clean Card Style
// web/src/pages/GeneralChat.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSlidersH, faPhone, faVideo, faUsers, faSearch, faTimes,
  faMagnifyingGlass, faUser, faPalette, faSave, faHome, faCompass,
  faChevronUp, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useNavbarStore } from '../store/navbarStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar } from '../components/chat/LeftSidebar';
import { RightSidebar } from '../components/chat/RightSidebar';
import { WelcomeSidebar } from '../components/chat/WelcomeSidebar';

import { MessageInput } from '../components/spaces/chat/centerPanel/MessageInput';
import { MessagesList } from '../components/spaces/chat/centerPanel/MessagesList';
import { PinnedBanner } from '../components/spaces/chat/centerPanel/PinnedBanner';
import { supabase } from '../lib/supabase';
import { getPrimaryParticipant, getConversationTitle } from '../components/chat/utils/chatUtils';
import { useRealtimeConversation } from '../hooks/useRealtime';
import {
  useAddConversationReaction,
  useConversations,
  useConversationMessages,
  useCreateDirectConversation,
  useCreateGroupConversation,
  useDeleteConversationMessage,
  useMarkConversationAsRead,
  usePinnedConversationMessages,
  usePinConversationMessage,
  useRemoveConversationReaction,
  useSearchUsers,
  useSendConversationMessage,
  useUpdateConversationMessage,
} from '../hooks/useConversations';
import { useAuthStore } from '../store/authStore';
import { useChatSettingsStore } from '../store/chatSettingsStore';
import { useGeneralChatSettingsStore } from '../store/generalChatSettingsStore';
import { getBackgroundStyle } from '../utils/themeUtils';
import { useBackgroundSizing, useShouldUseMirroredBackground } from '../hooks/useWindowSize';
import type { SearchUserResult } from '@4space/shared/src/services/conversations.service';
import type { Message } from '@4space/shared/src/services/messages.service';
import { buildLinkItems } from '../components/chat/utils/chatUtils';
import { buildFileItems } from '../components/chat/utils/chatUtils';
import { isSingleEmoji } from '../components/chat/utils/chatUtils';
import type { ChatTheme } from '@4space/shared/src/types/chatSettings';
// ====================================
// WELCOME SIDEBAR COMPONENT
// ====================================


// ====================================
// MAIN COMPONENT - Space Chat Replica for DMs
// ====================================

export function GeneralChat() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId?: string }>();

  const { user } = useAuthStore();
  const { showNavbar, toggleNavbar } = useNavbarStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(chatId || null);
  const [leftSidebarTab, setLeftSidebarTab] = useState<'conversations' | 'metrics' | 'productivity' | 'reminders' | 'notes'>('conversations');

  // Update selected conversation when URL changes
  useEffect(() => {
    if (chatId !== selectedConversationId) {
      setSelectedConversationId(chatId || null);
    }
  }, [chatId, selectedConversationId]);
  const [rightSidebarTab, setRightSidebarTab] = useState<'home' | 'saved' | 'theme' | 'settings'>('home');
  type HomeTab = 'metrics' | 'media' | 'links' | 'kept' | 'pinned' | 'customization' | 'settings';
  const [homeActiveTab, setHomeActiveTab] = useState<HomeTab>('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'favorites' | 'muted'>('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState<'direct' | 'group'>('direct');
  const [newChatQuery, setNewChatQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeCollection, setActiveCollection] = useState('Quick Notes');
  const [isMobile, setIsMobile] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [userClosedChat, setUserClosedChat] = useState(false);
  const [showWelcomeMenu, setShowWelcomeMenu] = useState(false);
  const [welcomeSidebarTab, setWelcomeSidebarTab] = useState<'overview' | 'profile' | 'activity' | 'settings'>('overview');

  // Use separate settings store for general chat (independent from space chat)
  const {
    showTimestamps,
    showReadReceipts,
    showAvatars,
    showUsernames,
    showMessageStatus,
    showTypingIndicator,
    showOnlineStatus,
    messageDensity,
    fontSize,
    theme,
    messageAnimations,
    autoScrollToBottom,
    groupMessages,
    enableMessageReactions,
    enableMessageReplies,
    allowMessageEditing,
    allowMessageDeletion,
    setTheme,
    updateSettings,
  } = useGeneralChatSettingsStore();

  // For animation preferences that come from shared store
  const { reduceAnimations } = useChatSettingsStore();

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: messagesData, isLoading: loadingMessages, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessages(selectedConversationId || undefined);
  const { data: pinnedMessages = [] } = usePinnedConversationMessages(selectedConversationId || undefined);

  const { data: searchResults = [] } = useSearchUsers(newChatQuery.trim());

  const createDirectConversation = useCreateDirectConversation();
  const createGroupConversation = useCreateGroupConversation();
  const sendMessage = useSendConversationMessage();
  const updateMessage = useUpdateConversationMessage();
  const deleteMessage = useDeleteConversationMessage();
  const pinConversationMessage = usePinConversationMessage();
  const addReaction = useAddConversationReaction();
  const removeReaction = useRemoveConversationReaction();
  const markConversationAsRead = useMarkConversationAsRead();

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const vaultConversation = useMemo(() => {
    return conversations.find((conversation) =>
      conversation.is_group &&
      conversation.name?.toLowerCase() === 'vault' &&
      (conversation.participants?.length || 0) <= 2
    );
  }, [conversations]);

  const messages = useMemo(() => messagesData?.pages.slice().reverse().flat() || [], [messagesData]);

  const normalizedMessages: Message[] = useMemo(() => {
    return messages.map((message: any) => ({
      ...message,
      room_id: message.conversation_id,
      space_id: message.conversation_id,
      is_pinned: message.is_pinned ?? false,
      is_system: message.is_system ?? false,
      updated_at: message.updated_at || message.created_at,
    })) as Message[];
  }, [messages]);

  const linkItems = useMemo(() => buildLinkItems(normalizedMessages), [normalizedMessages]);
  const fileItems = useMemo(() => buildFileItems(normalizedMessages), [normalizedMessages]);
  const mediaItems = useMemo(() => {
    return normalizedMessages
      .filter((message) => message.message_type === 'image' && message.metadata?.url)
      .slice(-12)
      .reverse();
  }, [normalizedMessages]);

  const overviewMetrics = useMemo(() => {
    return {
      messages: normalizedMessages.length,
      media: mediaItems.length,
      links: linkItems.length,
      files: fileItems.length,
      lastActive: selectedConversation?.last_message_at || selectedConversation?.updated_at || selectedConversation?.created_at,
    };
  }, [normalizedMessages.length, mediaItems.length, linkItems.length, fileItems.length, selectedConversation]);

  const { typingUsers, onlineUsers, sendTypingIndicator, stopTyping } = useRealtimeConversation(
    supabase as any,
    selectedConversationId || undefined,
    user?.id,
    !!selectedConversationId
  );

  const handleToggleFavorite = (conversationId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleToggleMute = (conversationId: string) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleSendMessage = useCallback(
    (content: string, type: string = 'text', attachments: any[] = []) => {
      if (!selectedConversationId) return;
      const trimmed = content.trim();
      if (!trimmed && attachments.length === 0) return;

      if (editingMessage) {
        // Capture and clear immediately for smooth UX
        const messageId = editingMessage.id;
        setEditingMessage(null);

        updateMessage.mutate({ messageId, content: trimmed });
        return;
      }

      // Capture reply ID and clear immediately for smooth UX
      const replyToId = replyTo?.id || null;
      if (replyTo) {
        setReplyTo(null);
      }

      const metadata: any = {
        ...(vaultConversation?.id === selectedConversationId ? { collection: activeCollection } : {}),
      };

      if (isSingleEmoji(trimmed)) {
        metadata.isSingleEmoji = true;
      }

      sendMessage.mutate({
        conversation_id: selectedConversationId,
        content: trimmed,
        message_type: type,
        reply_to_id: replyToId,
        attachments,
        metadata,
      });
    },
    [selectedConversationId, editingMessage, replyTo, vaultConversation, activeCollection]
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed auto-selection of first conversation on page load

  useEffect(() => {
    if (!selectedConversationId) return;
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    if (!lastMessage || lastMessage.sender_id !== user?.id) {
      markConversationAsRead.mutate(selectedConversationId);
    }
  }, [normalizedMessages, selectedConversationId]);


  const shouldUseMirror = useShouldUseMirroredBackground();
  const { tileCount, imageHeight } = useBackgroundSizing();


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setShowThread(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed auto-selection of first conversation


  // General chat uses its own settings directly (no per-room overrides needed)
  const activeTheme: ChatTheme = theme;
  const centerPanelBackgroundStyle = getBackgroundStyle(activeTheme);

  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter((conversation) => {
      if (filterMode === 'unread' && !(conversation.unread_count && conversation.unread_count > 0)) {
        return false;
      }
      if (filterMode === 'favorites' && !favorites.has(conversation.id)) return false;
      if (filterMode === 'muted' && !muted.has(conversation.id)) return false;
      if (!searchQuery.trim()) return true;
      const title = getConversationTitle(conversation, user?.id);
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (favorites.has(a.id) && !favorites.has(b.id)) return -1;
      if (!favorites.has(a.id) && favorites.has(b.id)) return 1;
      const aTime = new Date(a.last_message_at || a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.updated_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }, [conversations, filterMode, searchQuery, user?.id, favorites]);

  const handleOpenConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      setUserClosedChat(false); // Reset the closed flag when user manually opens a conversation
      setShowWelcomeMenu(false); // Close welcome sidebar when opening a chat
      // Navigate to the chat URL with smooth transition
      navigate(`/messages/${conversationId}`, { replace: true });
      if (isMobile) {
        setShowThread(true);
      }
    },
    [isMobile, navigate]
  );

  const handleCloseChat = useCallback(() => {
    setSelectedConversationId(null);
    setUserClosedChat(true);
    navigate('/messages', { replace: true });
  }, [navigate]);

  const handleOpenVault = async () => {
    if (vaultConversation) {
      handleOpenConversation(vaultConversation.id);
      return;
    }

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: 'Vault',
        participant_ids: [],
      });
      handleOpenConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create vault:', error);
    }
  };


  const handleDeleteMessage = useCallback(
    (messageId: string, deleteForEveryone: boolean = false) => {
      if (!confirm(deleteForEveryone ? 'Delete this message for everyone?' : 'Delete this message?')) return;
      deleteMessage.mutate(messageId);
    },
    []
  );

  const handlePinMessage = useCallback(
    (messageId: string, options: { pin: boolean; pinnedUntil?: string | null; keep?: boolean }) => {
      pinConversationMessage.mutate({
        messageId,
        pin: options.pin,
        pinnedUntil: options.pinnedUntil,
        keep: options.keep,
      });
    },
    []
  );

  const handleReaction = useCallback(
    (messageId: string, reaction: string) => {
      addReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleRemoveReaction = useCallback(
    (messageId: string, reaction: string) => {
      removeReaction.mutate({ messageId, reaction });
    },
    []
  );

  const handleCloseNewChat = () => {
    setShowNewChat(false);
    setNewChatQuery('');
    setGroupName('');
    setSelectedUsers([]);
    setNewChatMode('direct');
  };

  const handleSelectUser = async (userResult: SearchUserResult) => {
    if (newChatMode === 'direct') {
      try {
        const conversation = await createDirectConversation.mutateAsync(userResult.id);
        handleOpenConversation(conversation.id);
        handleCloseNewChat();
      } catch (error) {
        console.error('Failed to start direct conversation:', error);
      }
      return;
    }

    setSelectedUsers((prev) => {
      const exists = prev.some((entry) => entry.id === userResult.id);
      if (exists) {
        return prev.filter((entry) => entry.id !== userResult.id);
      }
      return [...prev, userResult];
    });
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName || selectedUsers.length === 0) return;

    try {
      const conversation = await createGroupConversation.mutateAsync({
        name: trimmedName,
        participant_ids: selectedUsers.map((participant) => participant.id),
      });
      handleOpenConversation(conversation.id);
      handleCloseNewChat();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };


  const selectedParticipant = selectedConversation
    ? getPrimaryParticipant(selectedConversation, user?.id)
    : null;
  const isParticipantOnline = selectedParticipant
    ? onlineUsers.has(selectedParticipant.user_id)
    : false;

  // ====================================
  // RENDER: Space Chat Replica Layout
  // ====================================

  return (
    <div className="h-full flex bg-transparent overflow-hidden">
      {/* LEFT SIDEBAR - Space Chat Replica */}
      <LeftSidebar
        conversations={conversations as unknown as any[]}
        selectedConversationId={selectedConversationId || undefined}
        onSelectConversation={handleOpenConversation}
        activeTab={leftSidebarTab}
        onTabChange={setLeftSidebarTab}
        isLoading={loadingConversations}
        onlineUsers={onlineUsers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        favorites={favorites}
        muted={muted}
        onToggleFavorite={handleToggleFavorite}
        onToggleMute={handleToggleMute}
        user={user}
        typingUsers={typingUsers}
      />

      {/* CENTER PANEL - Messages */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
        {selectedConversationId ? (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full flex flex-col"
            style={centerPanelBackgroundStyle}
          >
          {/* Background Tiles */}
          {activeTheme.backgroundType === 'featured' && activeTheme.backgroundImage && (
            <div className="absolute inset-0 pointer-events-none -z-10 flex flex-nowrap overflow-hidden">
              {[...Array(shouldUseMirror ? tileCount * 2 : tileCount)].map((_, i) => {
                const useMirrorImage = shouldUseMirror && i % 2 === 1;
                const imageSrc = useMirrorImage
                  ? activeTheme.backgroundImage?.replace('/src/assets/chat_themes_3/', '/src/assets/chat_themes_3_mirror/')
                  : activeTheme.backgroundImage;

                return (
                  <img
                    key={i}
                    src={imageSrc}
                    alt=""
                    className="flex-shrink-0"
                    style={{
                      height: imageHeight,
                      width: 'auto',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              {selectedConversation && (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-white">
                    {selectedConversation.is_group ? (
                      <FontAwesomeIcon icon={faUsers} />
                    ) : (
                      ((selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'U')[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {getConversationTitle(selectedConversation, user?.id)}
                    </p>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      {selectedConversation.is_group
                        ? `${selectedConversation.participants?.length || 0} members`
                        : isParticipantOnline
                          ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Online
                            </>
                          )
                          : 'Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faPhone} className="text-emerald-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faVideo} className="text-violet-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors">
                <FontAwesomeIcon icon={faSlidersH} className="text-cyan-400" />
              </button>
              <button
                onClick={handleCloseChat}
                className="w-9 h-9 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-red-400" />
              </button>
            </div>
          </div>

          {/* Pinned Banner */}
          {pinnedMessages.length > 0 && (
            <PinnedBanner
              pinnedMessages={pinnedMessages.map((message: any) => ({
                ...message,
                room_id: message.conversation_id,
                space_id: message.conversation_id,
                is_pinned: message.is_pinned ?? false,
                is_system: message.is_system ?? false,
                updated_at: message.updated_at || message.created_at,
              })) as Message[]}
              onScrollToMessage={(messageId: string) => console.log('Scroll to:', messageId)}
            />
          )}

          {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessagesList
                  messages={normalizedMessages}
                  currentUserId={user?.id}
                  onLoadMore={fetchNextPage}
                  hasMore={hasNextPage}
                  isLoading={loadingMessages}
                  isFetchingMore={isFetchingNextPage}
                  onReply={setReplyTo}
                  onEdit={setEditingMessage}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
              onBookmark={(messageId) => console.log('Bookmark:', messageId)}
                  onReaction={handleReaction}
                  onRemoveReaction={handleRemoveReaction}
                  theme={theme}
                  fontSize={fontSize}
                  messageDensity={messageDensity}
                  typingUsers={typingUsers}
                  showAvatars={showAvatars}
                  showUsernames={showUsernames}
                  showTimestamps={showTimestamps}
                  showReadReceipts={showReadReceipts}
                  showMessageStatus={showMessageStatus}
                  enableMessageReactions={enableMessageReactions}
                  enableMessageReplies={enableMessageReplies}
                  enableMessageForwarding
                  allowMessageEditing={allowMessageEditing}
                  allowMessageDeletion={allowMessageDeletion}
                  allowMessagePinning
                  groupMessages={groupMessages}
                  autoScrollToBottom={autoScrollToBottom}
                  messageAnimations={messageAnimations}
                  reduceAnimations={reduceAnimations}
                />
              </div>

              {/* Message Input */}
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
              placeholder={`Message ${selectedConversation ? getConversationTitle(selectedConversation, user?.id) : 'conversation'}...`}
                  allowFileUploads
                />
          </motion.div>
      ) : (
        <motion.div
          key="no-chat-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full flex flex-col items-center justify-center bg-transparent relative"
        >
          {/* Top Right Buttons */}
          <div className="absolute top-6 right-6 flex items-center gap-2" style={{ zIndex: 50 }}>
            {/* Navbar Toggle Button */}
            <button
              onClick={toggleNavbar}
              className="w-10 h-10 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/70 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
              title={showNavbar ? 'Hide navbar' : 'Show navbar'}
            >
              <FontAwesomeIcon
                icon={showNavbar ? faChevronUp : faChevronDown}
                className="text-cyan-400 text-lg"
              />
            </button>
            {/* Menu Button */}
            <button
              onClick={() => setShowWelcomeMenu(true)}
              className="w-10 h-10 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/70 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
            >
              <FontAwesomeIcon icon={faSlidersH} className="text-purple-400 text-lg" />
            </button>
          </div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-cyan-500/30 blur-xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-500/30 blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl"></div>
          </div>

          <div className="text-center max-w-lg px-6 relative z-10">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-emerald-500/20 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 animate-pulse"></div>
              <FontAwesomeIcon icon={faUsers} className="text-4xl text-cyan-400 relative z-10" />

              {/* Floating particles */}
              <div className="absolute top-2 right-3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 right-2 w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
            >
              Welcome to 4Space
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="text-zinc-300 text-base leading-relaxed mb-8 max-w-sm mx-auto"
            >
              Connect with friends, join communities, and start meaningful conversations. Choose a chat from the sidebar or create a new one to get started.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {/* Primary Action */}
              <button
                onClick={() => setShowNewChat(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 hover:from-cyan-400 hover:via-purple-400 hover:to-emerald-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <FontAwesomeIcon icon={faUser} className="text-lg relative z-10" />
                <span className="relative z-10">Start New Chat</span>

                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"></div>
              </button>

              {/* Secondary Action */}
              <button
                onClick={() => window.location.href = '/spaces'}
                className="px-6 py-4 bg-zinc-800/60 hover:bg-zinc-700/60 backdrop-blur-sm text-zinc-300 hover:text-white font-medium rounded-xl transition-all duration-300 border border-zinc-700/50 hover:border-zinc-600/50 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCompass} className="text-sm" />
                <span>Browse Spaces</span>
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="mt-12 flex justify-center gap-8 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{conversations.length}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Chats</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{onlineUsers.size}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Online</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">∞</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Spaces</div>
              </div>
            </motion.div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Welcome Menu Sidebar */}
      <AnimatePresence>
        {showWelcomeMenu && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden flex-shrink-0"
          >
            <WelcomeSidebar
              activeTab={welcomeSidebarTab}
              onTabChange={(tab) => setWelcomeSidebarTab(tab as 'overview' | 'profile' | 'activity' | 'settings')}
              onClose={() => setShowWelcomeMenu(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Chat Sidebar */}
      {selectedConversationId && (
        <div className="w-80 flex flex-col border-l border-zinc-800/50">
              {/* Main Tabs */}
              <div className="flex-shrink-0 p-3">
                <div className="flex gap-1 justify-center">
                  {[
                { id: 'home', icon: faHome, label: 'Home', color: 'cyan' },
                { id: 'saved', icon: faSave, label: 'Saved', color: 'green' },
                { id: 'theme', icon: faPalette, label: 'Theme', color: 'purple' },
                { id: 'settings', icon: faSlidersH, label: 'Settings', color: 'red' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setRightSidebarTab(tab.id as 'home' | 'theme' | 'saved' | 'settings')}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                    rightSidebarTab === tab.id
                      ? `bg-${tab.color}-500/15 text-${tab.color}-400 border border-${tab.color}-500/30 shadow-md`
                      : 'bg-zinc-800/40 text-gray-400 hover:text-gray-200 hover:bg-zinc-700/50'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={tab.icon}
                    className={`text-base ${
                      rightSidebarTab === tab.id
                        ? `text-${tab.color}-400`
                        : 'text-gray-500'
                    }`}
                  />
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {rightSidebarTab === 'home' && (
              <RightSidebar
                activeTab={homeActiveTab}
                onTabChange={(tab) => {
                  if (['metrics', 'media', 'links', 'kept', 'pinned', 'customization', 'settings'].includes(tab)) {
                    setHomeActiveTab(tab as HomeTab);
                  }
                }}
                theme={activeTheme}
                onThemeChange={setTheme as (theme: any, roomId?: string | undefined, category?: string | undefined) => void}
                messages={normalizedMessages as Message[]}
                selectedConversation={selectedConversation as unknown as any | undefined}
                onlineUsers={onlineUsers}
                mediaItems={mediaItems as any[]}
                linkItems={linkItems as any[]}
              />
            )}
            {rightSidebarTab === 'theme' && (
              <RightSidebar
                activeTab={'customization'}
                onTabChange={() => {}}
                theme={activeTheme}
                onThemeChange={setTheme as (theme: any, roomId?: string | undefined, category?: string | undefined) => void}
                messages={normalizedMessages as Message[]}
                selectedConversation={selectedConversation as unknown as any | undefined}
                onlineUsers={onlineUsers}
                mediaItems={mediaItems as any[]}
                linkItems={linkItems as any[]}
              />
            )}
            {rightSidebarTab === 'saved' && (
              <div className="h-full overflow-y-auto p-4 space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faSave} className="text-2xl text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Saved Messages</h3>
                  <p className="text-zinc-400 text-sm mb-4">Your personal saved messages</p>
                  <div className="text-sm text-zinc-500">
                    Feature coming soon - save messages privately for yourself
                  </div>
                </div>
              </div>
            )}
            {rightSidebarTab === 'settings' && (
              <RightSidebar
                activeTab={'settings'}
                onTabChange={() => {}}
                theme={activeTheme}
                onThemeChange={setTheme as (theme: any, roomId?: string | undefined, category?: string | undefined) => void}
                messages={normalizedMessages as Message[]}
                selectedConversation={selectedConversation as unknown as any | undefined}
                onlineUsers={onlineUsers}
                mediaItems={mediaItems as any[]}
                linkItems={linkItems as any[]}
              />
            )}
        </div>
        </div>
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleCloseNewChat}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6"
            >
              <button
                className="absolute right-6 top-6 w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                onClick={handleCloseNewChat}
              >
                <FontAwesomeIcon icon={faTimes} className="text-white" />
              </button>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-2">New Conversation</h3>
                <p className="text-sm text-zinc-400">Find someone to message</p>
              </div>

              <div className="mb-4 flex gap-3">
                {['direct', 'group'].map((mode) => (
                  <button
                    key={mode}
                    className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      newChatMode === mode
                        ? 'bg-zinc-800 text-white border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => setNewChatMode(mode as 'direct' | 'group')}
                  >
                    <FontAwesomeIcon icon={mode === 'direct' ? faUser : faUsers} className="mr-2" />
                    {mode === 'direct' ? 'Direct' : 'Group'}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={newChatQuery}
                  onChange={(e) => setNewChatQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {newChatQuery.trim().length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-3 text-zinc-700" />
                    <p>Search for users</p>
                  </div>
                )}

                {newChatQuery.trim().length > 0 && searchResults.length === 0 && (
                  <div className="p-8 text-center text-sm text-zinc-400">
                    <p>No results found</p>
                  </div>
                )}

                {searchResults.map((result) => {
                  const isSelected = selectedUsers.some((entry) => entry.id === result.id);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectUser(result)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-white">
                        {(result.display_name || result.username || 'U')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-white">
                          {result.display_name || result.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-zinc-400">{result.username || result.email}</p>
                      </div>
                      {newChatMode === 'direct' ? (
                        <span className="text-xs font-bold text-zinc-400">Start</span>
                      ) : (
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {isSelected ? 'Added' : 'Add'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {newChatMode === 'group' && (
                <button
                  className="mt-4 w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  onClick={handleCreateGroup}
                >
                  Create Group
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

